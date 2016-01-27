define("ChangePasswordModule", ["ChangePasswordModuleResources", "BaseModule"],
	function(resources) {
		return Ext.define("Terrasoft.configuration.ChangePasswordModule", {
			alternateClassName: "Terrasoft.CardModule",
			extend: "Terrasoft.BaseModule",
			Ext: null,
			sandbox: null,
			Terrasoft: null,

			viewModel: null,
			isAsync: true,

			init: function(callback, scope) {
				this.initHistoryState();
				this.viewModel = this.createViewModel();
				this.viewModel.actualizeColumnRequired();
				this.initIsLdap(callback, scope);
			},

			render: function(renderTo) {
				var view = this.generateView();
				view.bind(this.viewModel);
				view.render(renderTo);
				var headerCaption = resources.localizableStrings.headerCaption;
				this.sandbox.publish("ChangeHeaderCaption", {
					caption: headerCaption,
					dataViews: new Terrasoft.Collection()
				});
				this.sandbox.subscribe("NeedHeaderCaption", function() {
					this.sandbox.publish("InitDataViews", {
						caption: headerCaption
					});
				}, this);
			},

			initHistoryState: function() {
				var sandbox = this.sandbox;
				var state = sandbox.publish("GetHistoryState");
				var currentHash = state.hash;
				var currentState = state.state || {};
				if (currentState.moduleId === sandbox.id) {
					return;
				}
				var newState = Terrasoft.deepClone(currentState);
				newState.moduleId = sandbox.id;
				sandbox.publish("ReplaceHistoryState", {
					stateObj: newState,
					hash: currentHash.historyState,
					silent: true
				});
			},

			initIsLdap: function(callback, scope) {
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "SysAdminUnit"
				});
				esq.addColumn("SynchronizeWithLDAP");
				esq.getEntity(Terrasoft.SysValue.CURRENT_USER.value, function(result) {
					var entity = result.entity;
					if (entity) {
						this.viewModel.set("isLdap", entity.get("SynchronizeWithLDAP"));
						callback.call(scope);
					}
				}, this);
			},

			createViewModel: function() {
				var Ext = this.Ext;
				var Terrasoft = this.Terrasoft;
				var sandbox = this.sandbox;
				return this.Ext.create("Terrasoft.BaseViewModel", {
					columns: {
						currentPassword: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							isRequired: true
						},
						newPassword: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							isRequired: true
						},
						newPasswordConfirmation: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							isRequired: true
						}
					},
					values: {
						currentPassword: "",
						newPassword: "",
						newPasswordConfirmation: "",
						isLdap: false
					},
					validationConfig: {
						newPassword: [
							function(newPassword) {
								var newPasswordConfirmation = this.get("newPasswordConfirmation");
								var invalidMessage = "";
								if (!Ext.isEmpty(newPasswordConfirmation)) {
									if (newPasswordConfirmation !== newPassword) {
										invalidMessage = resources.localizableStrings.passwordMissMatchMessageCaption;
									} else {
										this.validationInfo.set("newPasswordConfirmation", {
											invalidMessage: "",
											isValid: true
										});
									}
								}
								return {
									invalidMessage: invalidMessage
								};
							}
						],
						newPasswordConfirmation: [
							function(newPasswordConfirmation) {
								var newPassword = this.get("newPassword");
								var invalidMessage = "";
								if (newPasswordConfirmation !== newPassword) {
									invalidMessage = resources.localizableStrings.passwordMissMatchMessageCaption;
								} else {
									this.validationInfo.set("newPassword", {
										invalidMessage: "",
										isValid: true
									});
								}
								return {
									invalidMessage: invalidMessage
								};
							}
						]
					},
					methods: {
						actualizeColumnRequired: function() {
							this.columns.currentPassword.isRequired = this.isNotRecoveryMode();
						},

						isNotRecoveryMode: function() {
							var hash = Terrasoft.router.Router.getHash();
							return hash.indexOf("PasswordRecoveryMode") === -1;
						},

						getParameterByName: function(name) {
							name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
							var hash = Terrasoft.router.Router.getHash();
							var regex = new RegExp("[\\?&]" + name + "=([^&]*)"),
							results = regex.exec(hash);
							return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
						},

						successRedirect: function() {
							if (this.isNotRecoveryMode()) {
								sandbox.publish("BackHistoryState");
							} else {
								var location = window.location;
								var origin = location.origin || location.protocol + "//" + location.host;
								var url = Ext.String.format("{0}{1}#MainMenu", origin, location.pathname);
								window.location.href = url;
							}
						},

						onChangePasswordClick: function() {
							var isValid = this.validate();
							if (!isValid) {
								return;
							}
							var password = this.get("currentPassword");
							var newPassword = this.get("newPassword");
							var newPasswordConfirmation = this.get("newPasswordConfirmation");
							var sysValues = Terrasoft.SysValue;
							var passwordRecoveryModeKey = this.getParameterByName("PasswordRecoveryMode");
							var authToken = {
								UserName: sysValues.CURRENT_USER.displayValue,
								UserPassword: password,
								WorkspaceName: sysValues.CURRENT_WORKSPACE.displayValue,
								NewUserPassword: newPassword,
								ConfirmUserPassword: newPasswordConfirmation,
								PasswordRecoveryMode: passwordRecoveryModeKey
							};
							var changePasswordServiceUrl = Terrasoft.workspaceBaseUrl +
								"/../ServiceModel/AuthService.svc/DoChangePasswordLogin";
							Terrasoft.AjaxProvider.request({
								url: changePasswordServiceUrl,
								method: "POST",
								jsonData: authToken,
								callback: function(options, result, response) {
									var localizableStrings = resources.localizableStrings;
									if (!result) {
										var errorMessage = localizableStrings.errorPasswordChangeMessage;
										this.showInformationDialog(errorMessage, Ext.emptyFn);
									}
									var responseObject = Terrasoft.decode(response.responseText);
									if (responseObject.Code !== 0) {
										this.showInformationDialog(responseObject.Message, Ext.emptyFn);
									} else {
										var successMessage = localizableStrings.successPasswordChangeMessage;
										this.showInformationDialog(successMessage, function() {
											this.successRedirect();
										});
									}
								},
								scope: this
							});
						},

						onCancelClick: function() {
							this.successRedirect();
						},

						onNewPasswordKeypress: function() {
							var newPasswordTextEdit = Ext.getCmp("new-password");
							var newPasswordInputValue = newPasswordTextEdit.getTypedValue();
							this.set("newPassword", newPasswordInputValue);
						},

						onNewPasswordConfirmationKeypress: function() {
							var newPasswordConfirmationTextEdit = Ext.getCmp("new-password-confirmation");
							var newPasswordConfirmationInputValue = newPasswordConfirmationTextEdit.getTypedValue();
							this.set("newPasswordConfirmation", newPasswordConfirmationInputValue);
						}
					}
				});
			},

			generateView: function() {
				var Ext = this.Ext;
				var buttonsConfig = Ext.create("Terrasoft.Container", {
					id: "buttonsMenu",
					classes: {
						wrapClassName: ["change-password-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "main-buttons-container",
							classes: {
								wrapClassName: ["main-buttons"]
							},
							items: [
								{
									className: "Terrasoft.Button",
									id: "change-password-button",
									caption: resources.localizableStrings.saveButtonCaption,
									style: Terrasoft.controls.ButtonEnums.style.GREEN,
									enabled: {
										bindTo: "isLdap",
										bindConfig: {
											converter: function(value) {
												return !value;
											}
										}
									},
									click: {
										bindTo: "onChangePasswordClick"
									},
									classes: {
										textClass: ["change-password-save-button"]
									}
								},
								{
									className: "Terrasoft.Button",
									id: "cancel-button",
									caption: resources.localizableStrings.cancelButtonCaption,
									click: {
										bindTo: "onCancelClick"
									}
								}
							]
						}
					]
				});
				var leftPanelConfig = {
					className: "Terrasoft.Container",
					id: "leftPanelContainer",
					classes: {
						wrapClassName: ["leftPanelContainer"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							caption: resources.localizableStrings.currentPasswordCaption,
							classes: {
								labelClass: [
									"password-caption",
									"controlCaption"
								]
							},
							isRequired: true,
							visible: {
								bindTo: "isNotRecoveryMode"
							}
						},
						{
							className: "Terrasoft.TextEdit",
							id: "current-password",
							classes: {
								wrapClass: ["search-edit"]
							},
							value: {
								bindTo: "currentPassword"
							},
							protect: true,
							visible: {
								bindTo: "isNotRecoveryMode"
							}
						},
						{
							className: "Terrasoft.Label",
							caption: resources.localizableStrings.newPasswordCaption,
							classes: {
								labelClass: [
									"password-caption",
									"controlCaption"
								]
							},
							isRequired: true
						},
						{
							className: "Terrasoft.TextEdit",
							id: "new-password",
							classes: {
								wrapClass: ["search-edit"]
							},
							value: {
								bindTo: "newPassword"
							},
							protect: true,
							keyup: {
								bindTo: "onNewPasswordKeypress"
							}
						},
						{
							className: "Terrasoft.Label",
							caption: resources.localizableStrings.newPassworConfirmationCaption,
							classes: {
								labelClass: [
									"password-caption",
									"controlCaption"
								]
							},
							isRequired: true
						},
						{
							className: "Terrasoft.TextEdit",
							id: "new-password-confirmation",
							classes: {
								wrapClass: ["search-edit"]
							},
							value: {
								bindTo: "newPasswordConfirmation"
							},
							protect: true,
							keyup: {
								bindTo: "onNewPasswordConfirmationKeypress"
							}
						}
					]
				};
				return Ext.create("Terrasoft.Container", {
					id: "top-container",
					items: [
						buttonsConfig,
						leftPanelConfig
					]
				});
			}

		});
	}
);