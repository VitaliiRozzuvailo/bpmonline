define('Registration', ['ext-base', 'terrasoft', 'sandbox', 'RegistrationResources'],
		function(Ext, Terrasoft, sandbox, resources) {

	var module = {};
	var renderContainer;
	var userManagementToken;

	var callServiceMethod = function(name, callback, data, scope) {
		Terrasoft.AjaxProvider.request({
			url: Terrasoft.workspaceBaseUrl + '/rest/UserManagementService/' + name,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			method: 'POST',
			jsonData: data,
			callback: function(request, success, response) {
				var responseObject = {};
				if (success) {
					responseObject = Terrasoft.decode(response.responseText);
				}
				callback.call(this, success, responseObject);
			},
			scope: scope
		});
	};

	var prepareModel = function() {
		module.model = Ext.create('Terrasoft.BaseViewModel', {
			columns: {
				Surname: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					caption: resources.localizableStrings.Surname
				},
				FirstName: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					caption: resources.localizableStrings.FirstName
				},
				AdditionalName: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					caption: resources.localizableStrings.AdditionalName
				},
				Email: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					caption: resources.localizableStrings.Email
				},
				Password: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					caption: resources.localizableStrings.Password
				},
				ConfirmPassword: {
					dataValueType: Terrasoft.DataValueType.TEXT,
					isRequired: true,
					caption: resources.localizableStrings.ConfirmPassword
				}
			},
			methods: {
				onRegisterClick: function() {
					var columns = ['Surname', 'FirstName', 'Email', 'Password', 'ConfirmPassword'];
					var invalidColumns = [];
					columns.forEach(function(columnName) {
						var value = this.get(columnName);
						if (!value) {
							invalidColumns.push(this.columns[columnName].caption);
						}
					}, this);
					if (invalidColumns.length) {
						var message;
						var value;
						if (invalidColumns.length === 1) {
							message = resources.localizableStrings.RequiredField;
							value = invalidColumns[0];
						} else {
							message = resources.localizableStrings.RequiredFields;
							value = invalidColumns.join(', ');
						}
						this.showInformationDialog(Ext.String.format(message, value));
					} else if (this.get('Email').indexOf('@') === -1) {
						this.showInformationDialog(resources.localizableStrings.InvalidEmail);
					} else if (this.get('Password') !== this.get('ConfirmPassword')) {
						this.showInformationDialog(resources.localizableStrings.PasswordsDoNotMatch);
					} else {
						var registerCallback = function(success, response) {
							if (!success) {
								return;
							}
							var responseObject = Terrasoft.decode(response);
							var resultCode = responseObject.ResultCode;
							if (!resultCode) {
								return;
							}
							switch (resultCode) {
								case 'ExistingSysAdminUnit':
								case 'Error':
									var resultMessage = responseObject.ResultMessage.replace(/\\n/g, "\n");
									this.showInformationDialog(resultMessage);
									break;
								case 'Success':
									var successMessage = resources.localizableStrings.SuccessMessage;
									this.showInformationDialog(successMessage, function() {
										callServiceMethod('Logout', function() {
											window.logout = true;
											window.location.replace(Terrasoft.loaderBaseUrl + "SspLogin.aspx");
										});
									});
									break;
							}
						};
						userManagementToken = {
							Surname: this.get('Surname'),
							FirstName: this.get('FirstName'),
							AdditionalName: this.get('AdditionalName'),
							Email: this.get('Email'),
							Password: this.get('Password'),
							WorkspaceBaseUrl: Terrasoft.loaderBaseUrl
						};
						callServiceMethod('Register', registerCallback, userManagementToken, this);
					}
				},

				onKeyUp: function(e) {
					if (e && e.keyCode === e.ENTER) {
						this.onRegisterClick();
					}
				}
			}
		});
	};

	var renderView = function(renderTo) {
		var imageUrl = 'terrasoft.axd?s=nui-binary-syssetting&r=Logoimage';
		var html = '<img id = "bpmonline-logo" src = "' + imageUrl + '">';
		var logo = {
			id: 'bpmonline-logo',
			className: 'Terrasoft.HtmlControl',
			html: html,
			selectors: {wrapEl: '#bpmonline-logo'}
		};
		var surnameLabel = Ext.create('Terrasoft.Label', {
			caption: resources.localizableStrings.Surname,
			classes: {labelClass: ['label t-label-is-required']}
		});
		var surnameEdit = Ext.create('Terrasoft.TextEdit', {
			value: {bindTo: 'Surname'},
			classes: {wrapClass: ['edit']},
			keyup: {bindTo: 'onKeyUp'}
		});
		var firstNameLabel = Ext.create('Terrasoft.Label', {
			caption: resources.localizableStrings.FirstName,
			classes: {labelClass: ['label t-label-is-required']}
		});
		var fistNameEdit = Ext.create('Terrasoft.TextEdit', {
			value: {bindTo: 'FirstName'},
			classes: {wrapClass: ['edit']},
			keyup: {bindTo: 'onKeyUp'}
		});
		var additionalNameLabel = Ext.create('Terrasoft.Label', {
			caption: resources.localizableStrings.AdditionalName,
			classes: {labelClass: ['label']}
		});
		var additionalNameEdit = Ext.create('Terrasoft.TextEdit', {
			value: {bindTo: 'AdditionalName'},
			classes: {wrapClass: ['edit']},
			keyup: {bindTo: 'onKeyUp'}
		});
		var mailLabel = Ext.create('Terrasoft.Label', {
			caption: resources.localizableStrings.Email,
			classes: {labelClass: ['label t-label-is-required']}
		});
		var mailEdit = Ext.create('Terrasoft.TextEdit', {
			value: {bindTo: 'Email'},
			classes: {wrapClass: ['edit']},
			keyup: {bindTo: 'onKeyUp'}
		});
		var passwordLabel = Ext.create('Terrasoft.Label', {
			caption: resources.localizableStrings.Password,
			classes: {labelClass: ['label t-label-is-required']}
		});
		var passwordEdit = Ext.create('Terrasoft.TextEdit', {
			value: {bindTo: 'Password'},
			classes: {wrapClass: ['edit']},
			protect: true,
			keyup: {bindTo: 'onKeyUp'}
		});
		var confirmPasswordLabel = Ext.create('Terrasoft.Label', {
			caption: resources.localizableStrings.ConfirmPassword,
			classes: {labelClass: ['label t-label-is-required']}
		});
		var confirmPasswordEdit = Ext.create('Terrasoft.TextEdit', {
			value: {bindTo: 'ConfirmPassword'},
			classes: {wrapClass: ['edit']},
			protect: true,
			keyup: {bindTo: 'onKeyUp'}
		});
		var registerButton = Ext.create('Terrasoft.Button', {
			caption: resources.localizableStrings.Register,
			style: Terrasoft.controls.ButtonEnums.style.GREEN,
			classes: {textClass: ['button']},
			click: {bindTo: 'onRegisterClick'}
		});
		var registrationContainer = Ext.create('Terrasoft.Container', {
			id: 'registrationContainer',
			selectors: {wrapEl: '#registrationContainer'},
			items: [surnameLabel, surnameEdit, firstNameLabel, fistNameEdit, additionalNameLabel, additionalNameEdit,
				mailLabel, mailEdit, passwordLabel, passwordEdit,
				confirmPasswordLabel, confirmPasswordEdit, registerButton]
		});
		var contFooter = Ext.create('Terrasoft.Container', {
			id: 'loginFooterContainer',
			classes: {
				wrapClassName: ['login-container-footer']
			}
		});
		module.view = Ext.create('Terrasoft.Container', {
			id: 'container',
			selectors: {wrapEl: '#container'},
			classes: {wrapClassName: ['registration-container']},
			items: [logo, registrationContainer, contFooter],
			renderTo: renderTo
		});
	};

	var init = function() {
		prepareModel();
	};

	var render = function(renderTo) {
		renderContainer = renderTo;
		renderView(renderContainer);
		module.view.bind(module.model);
	};

	return {
		init: init,
		render: render,
		renderTo: Ext.getBody()
	};
});