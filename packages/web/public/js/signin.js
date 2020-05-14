(function (window) {
	const LOGIN_URL = 'http://localhost/login';
	const CLIENT_ID = '737190065341-gsipv4sub7vgfoad1c1hq082ond4vkb0.apps.googleusercontent.com';
	gapi.load('auth2', function () {
		auth2 = gapi.auth2.init({
			client_id: CLIENT_ID,
			fetch_basic_profile: false,
			scope: 'openid email',
		});
	});

	gapi.signin2.render('gSignIn', {
		onsuccess: async function (googleUser) {
			const idToken = googleUser.getAuthResponse().id_token;
			await window.fetch(LOGIN_URL, {
				method: 'POST',
				headers: {
					['Content-Type']: 'application/x-www-form-urlencoded',
				},
				body: `idtoken=${idToken}`,
			});

			window.location.href = '/play';
		},
	});
})(window);
