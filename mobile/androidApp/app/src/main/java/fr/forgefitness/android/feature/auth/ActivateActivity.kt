package fr.forgefitness.android.feature.auth

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.TextWatcher
import android.view.KeyEvent
import android.widget.Button
import android.widget.EditText
import android.widget.ImageView
import android.widget.LinearLayout
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class ActivateActivity : AppCompatActivity() {

    private lateinit var boxes: List<EditText>
    private lateinit var btnValidate: Button
    private lateinit var errorText: TextView
    private lateinit var errorContainer: LinearLayout
    private lateinit var helpButton: TextView
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
        )[AuthViewModel::class.java]

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
        errorContainer = findViewById(R.id.errorContainer)
        helpButton = findViewById(R.id.helpButton)

        setupCodeBoxes()
        setupValidateButton()
        setupHelpButton()
        observeUi()

        lifecycleScope.launch {
            delay(300)
            boxes.first().requestFocus()
        }
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
            boxes[i].filters = arrayOf(InputFilter.LengthFilter(1))

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
                        cleaned.length == 1 -> {
                            if (raw != cleaned) {
                                boxes[i].setText(cleaned)
                                boxes[i].setSelection(1)
                            }
                            if (i < boxes.lastIndex) {
                                boxes[i + 1].requestFocus()
                            } else {
                                boxes[i].clearFocus()
                                checkAndActivate()
                            }
                        }
                        cleaned.isEmpty() && i > 0 -> boxes[i - 1].requestFocus()
                    }

                    updateValidateButton()
                }
            })
        }
    }

    private fun setupValidateButton() {
        btnValidate.setOnClickListener {
            if (vm.ui.value.loading) return@setOnClickListener

            val code = boxes.joinToString("") { it.text.toString().trim() }
            vm.onCodeChange(code)
            vm.activate()
        }
    }

    private fun setupHelpButton() {
        helpButton.setOnClickListener {
            val intent = Intent(Intent.ACTION_SENDTO).apply {
                data = Uri.parse("mailto:")
                putExtra(Intent.EXTRA_EMAIL, arrayOf(getString(R.string.activate_help_email)))
                putExtra(Intent.EXTRA_SUBJECT, getString(R.string.activate_help_subject))
            }
            if (intent.resolveActivity(packageManager) != null) {
                startActivity(intent)
            }
        }
    }

    private fun checkAndActivate() {
        val allFilled = boxes.all { it.text.toString().isNotBlank() }
        if (allFilled && !vm.ui.value.loading) {
            val code = boxes.joinToString("") { it.text.toString().trim() }
            vm.onCodeChange(code)
            vm.activate()
        }
    }

    private fun updateValidateButton() {
        val allFilled = boxes.all { it.text.toString().isNotBlank() }
        btnValidate.isEnabled = allFilled
    }

    private fun observeUi() {
        lifecycleScope.launch {
            repeatOnLifecycle(Lifecycle.State.STARTED) {
                vm.ui.collect { state ->
                    btnValidate.text = if (state.loading) {
                        getString(R.string.activate_button_loading)
                    } else {
                        getString(R.string.activate_button)
                    }

                    btnValidate.isEnabled = !state.loading && boxes.all { it.text.toString().isNotBlank() }
                    btnValidate.alpha = if (state.loading) 0.6f else 1f
                    btnValidate.isClickable = !state.loading

                    val errorIcon = findViewById<ImageView>(R.id.errorIcon)
                    if (state.error != null) {
                        errorText.text = state.error
                        errorIcon.isVisible = true
                    } else {
                        errorText.text = ""
                        errorIcon.isVisible = false
                    }

                    if (state.done) {
                        startActivity(
                            Intent(this@ActivateActivity, MainActivity::class.java).apply {
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
        updateValidateButton()
    }
}