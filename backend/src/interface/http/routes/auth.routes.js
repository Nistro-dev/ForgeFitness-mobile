export async function authRoutes(app) {
    const ctrl = app.diContainer.resolve('authController');
    app.post('/auth/issue', ctrl.issue);
    app.post('/auth/activate', ctrl.activateWithKey);
}
