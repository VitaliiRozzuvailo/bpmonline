define('EmailHelper', ['ext-base', 'terrasoft', 'EmailHelperResources', 'ConfigurationConstants', 'MaskHelper'],
	function(Ext, Terrasoft, resources, ConfigurationConstants, MaskHelper) {

		function isEmailAddress(emailAddress) {
			var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
			return emailPattern.test(emailAddress);
		}

		function getEmailUrl(emailAddress) {
			if (isEmailAddress(emailAddress)) {
				return 'mailto:' + emailAddress;
			}
			return '';
		}

		function onEmailUrlClick(emailAddress) {
			var url = getEmailUrl(emailAddress);
			if (!Ext.isEmpty(url)) {
				var win = window.open(url, '', 'height=1,width=1');
				setTimeout(function() {
					win.close();
				}, 1000);
			}
		}

		return {
			isEmailAddress: isEmailAddress,
			getEmailUrl: getEmailUrl,
			onEmailUrlClick: onEmailUrlClick
		};
	});