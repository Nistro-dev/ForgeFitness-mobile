package fr.forgefitness.android.feature.auth

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.TextWatcher
import android.view.KeyEvent
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.repeatOnLifecycle
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.common.api.CommonStatusCodes
import com.google.android.gms.common.api.Status
import fr.forgefitness.android.MainActivity
import fr.forgefitness.android.R

class ActivateActivity : AppCompatActivity() {

    private lateinit var boxes: List<EditText>
    private lateinit var btnValidate: Button
    private lateinit var errorText: TextView
    private lateinit var vm: AuthViewModel

    private val smsConsentLauncher =
        registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
            val data = result.data
            val message = data?.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE) ?: return@registerForActivityResult
            val code = message.filter { it.isLetterOrDigit() }.uppercase()
            if (code.length == 6) {
                fillBoxes(code)
                vm.trySetFullCode(code)
            }
        }

    private val smsReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            if (SmsRetriever.SMS_RETRIEVED_ACTION != intent.action) return
            val extras = intent.extras ?: return
            val status = extras[SmsRetriever.EXTRA_STATUS] as Status
            when (status.statusCode) {
                CommonStatusCodes.SUCCESS -> {
                    val consentIntent = extras[SmsRetriever.EXTRA_CONSENT_INTENT] as Intent
                    smsConsentLauncher.launch(consentIntent)
                }
                else -> { }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_activate)

        vm = ViewModelProvider(
            this,
            AuthVMFactory(application)
        ).get(AuthViewModel::class.java)

        boxes = listOf(
            findViewById(R.id.et_1),
            findViewById(R.id.et_2),
            findViewById(R.id.et_3),
            findViewById(R.id.et_4),
            findViewById(R.id.et_5),
            findViewById(R.id.et_6)
        )
        btnValidate = findViewById(R.id.btn_validate)
        errorText = findViewById(R.id.errorText)

        setupCodeBoxes()
        setupValidateButton()
        observeUi()
    }

    override fun onStart() {
        super.onStart()

        val filter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)

        ContextCompat.registerReceiver(
            this,
            smsReceiver,
            filter,
            ContextCompat.RECEIVER_EXPORTED
        )

        SmsRetriever.getClient(this).startSmsUserConsent(null)
    }

    override fun onStop() {
        super.onStop()
        runCatching { unregisterReceiver(smsReceiver) }
    }


    private fun setupCodeBoxes() {
        for (i in boxes.indices) {
            // 🔒 Filtre matériel : 1 caractère maximum
            boxes[i].filters = arrayOf(InputFilter.LengthFilter(1))

            // Backspace: revenir à la case précédente si vide
            boxes[i].setOnKeyListener { _, keyCode, event ->
                if (keyCode == KeyEvent.KEYCODE_DEL && event.action == KeyEvent.ACTION_DOWN) {
                    if (boxes[i].text.isNullOrEmpty() && i > 0) {
                        boxes[i - 1].requestFocus()
                        boxes[i - 1].setSelection(boxes[i - 1].text?.length ?: 0)
                        return@setOnKeyListener true
                    }
                }
                false
            }

            boxes[i].addTextChangedListener(object : TextWatcher {
                override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
                override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}

                override fun afterTextChanged(s: Editable?) {
                    val raw = s?.toString().orEmpty()
                    val cleaned = raw.filter { it.isLetterOrDigit() }.uppercase()

                    when {
                        // Saisie normale: 1 caractère → case suivante
                        cleaned.length == 1 -> {
                            if (raw != cleaned) {
                                boxes[i].setText(cleaned)
                                boxes[i].setSelection(1)
                            }
                            if (i < boxes.lastIndex) boxes[i + 1].requestFocus()
                        }
                        // Effacement → case précédente
                        cleaned.isEmpty() && i > 0 -> boxes[i - 1].requestFocus()
                    }
                }
            })
        }
    }

    private fun setupValidateButton() {
        btnValidate.setOnClickListener {
            // Ignore les clics pendant le chargement
            if (vm.ui.value.loading) return@setOnClickListener
            
            val code = boxes.joinToString("") { it.text.toString().trim() }
            vm.onCodeChange(code)
            vm.activate()
        }
    }

    private fun observeUi() {
        lifecycleScope.launchWhenStarted {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                vm.ui.collect { state ->
                    // Freeze le bouton pendant le chargement (pas de loader)
                    btnValidate.isEnabled = !state.loading
                    btnValidate.alpha = if (state.loading) 0.6f else 1f
                    btnValidate.isClickable = !state.loading

                    // Affiche ou masque le message d'erreur
                    errorText.isVisible = state.error != null
                    errorText.text = state.error ?: ""

                    // Navigation si succès
                    if (state.done) {
                        startActivity(
                            Intent(this@ActivateActivity, MainActivity::class.java).apply {
                                // Nettoie la pile pour éviter retour sur Activate
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
                            }
                        )
                        finish()
                    }
                }
            }
        }
    }

    private fun fillBoxes(code: String) {
        val cleaned = code.filter { it.isLetterOrDigit() }.uppercase()
        if (cleaned.length != 6) return
        boxes.forEachIndexed { index, editText ->
            editText.setText(cleaned[index].toString())
        }
        boxes.last().clearFocus()
        btnValidate.requestFocus()
    }
}