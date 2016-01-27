define("ProfileModule", ["ext-base", "terrasoft", "sandbox", "ProfileModuleResources", "ConfigurationConstants",
	"LookupUtilities", "Contact", "StorageUtilities", "SysAdminUnit", "CtiConstants", "DesktopPopupNotification",
	"ServiceHelper", "MaskHelper"],
	function(Ext, Terrasoft, sandbox, resources, ConfigurationConstants,
		LookupUtilities, Contact, storageUtilities, SysAdminUnit, CtiConstants, DesktopPopupNotification,
		ServiceHelper, MaskHelper) {
		var viewModel;
		var container;

		function callServiceMethod(methodName, callback, dataSend) {
			var ajaxProvider = Terrasoft.AjaxProvider;
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/CommandLineService/" + methodName;
			var request = ajaxProvider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
			return request;
		}

		function getCulture() {
			var sysAdminUnitSelect = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SysAdminUnit"});
			sysAdminUnitSelect.addColumn("Id");
			sysAdminUnitSelect.addColumn("SysCulture.Id");
			sysAdminUnitSelect.addColumn("SysCulture.Name");
			sysAdminUnitSelect.addColumn("TimeZoneId");
			var timeZoneIdColumn = sysAdminUnitSelect.addColumn("[TimeZone:Code:TimeZoneId].Id");
			var timeZoneNameColumn = sysAdminUnitSelect.addColumn("[TimeZone:Code:TimeZoneId].Name");
			sysAdminUnitSelect.getEntity(Terrasoft.SysValue.CURRENT_USER.value, function(result) {
				var entity = result.entity;
				if (entity) {
					var sysCutureId = entity.get("SysCulture.Id");
					var sysCutureName = entity.get("SysCulture.Name");
					var timeZoneCode = entity.get("TimeZoneId");
					var timeZoneId = entity.get(timeZoneIdColumn.columnPath);
					var timeZoneName = entity.get(timeZoneNameColumn.columnPath);
					viewModel.set("defculture", {value: sysCutureId, displayValue: sysCutureName});
					viewModel.set("deftimeZone", {value: timeZoneId, displayValue: timeZoneName, code: timeZoneCode});
					viewModel.set("deftimeZoneId", entity.get("TimeZoneId"));
					viewModel.set("culture", {value: sysCutureId, displayValue: sysCutureName});
					viewModel.set("timeZone", {value: timeZoneId, displayValue: timeZoneName, code: timeZoneCode});
					viewModel.set("timeZoneId", entity.get("TimeZoneId"));
				}
			}, this);
		}

		/**
		 * Инициализирует контекстную справку.
		 * @protected
		 * @virtual
		 */
		function loadContextHelp(id) {
			var contextHelpConfig = {
				contextHelpId: id,
				contextHelpCode: "ProfileModule"
			};
			sandbox.publish("InitContextHelp", contextHelpConfig);
		}

		function loadHeader(renderTo) {
			if (!viewModel) {
				viewModel = getViewModel();
			}
			var viewConfig = getViewModel();
			viewConfig = generateMainView();
			Terrasoft.SysSettings.querySysSettingsItem("ShowDemoLinks", function(value) {
				viewModel.set("visibleByBuildType", !value);
			}, this);
			viewConfig.bind(viewModel);
			viewConfig.render(renderTo);
		}

		/**
		 * Возвращает заголовок кнопки запроса нотификации по текущим резрешениям браузера.
		 * @private
		 * @returns {String} Возвращает заголовок для кнопки.
		 */
		function getNotificationButtonCaption() {
			switch (DesktopPopupNotification.getPermissionLevel()) {
				case DesktopPopupNotification.PermissionType.GRANTED:
					return resources.localizableStrings.childDisplayNotificationsAllowCaption;
				case DesktopPopupNotification.PermissionType.DENIED:
					return resources.localizableStrings.childDisplayNotificationsDeniedCaption;
				default:
					return resources.localizableStrings.childDisplayNotificationsCaption;
			}
		}

		var getViewModel = function() {
			return Ext.create("Terrasoft.BaseViewModel", {
				columns: {
					languageList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "languageList",
						isCollection: true
					},
					culture: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						name: "culture",
						isRequired: true
					}
				},
				values: {
					languageList: Ext.create("Terrasoft.Collection"),
					timeZone: null,
					timeZoneList: Ext.create("Terrasoft.Collection"),
					timeZoneId: null,
					visibleByBuildType: false,
					notificationButtonCaption: getNotificationButtonCaption(),
					notificationButtonEnabled: DesktopPopupNotification.getPermissionLevel() ===
						DesktopPopupNotification.PermissionType.DEFAULT,
					isNotificationsSupported: DesktopPopupNotification.getIsNotificationSupported(),
					isSsp: (Terrasoft.CurrentUser.userType === Terrasoft.UserType.SSP)
				},
				methods: {
					onCancel: function() {
						sandbox.publish("BackHistoryState");
					},
					onClick: function() {
						if (this.validate()) {
							var culture = this.get("culture");
							var defCulture = viewModel.get("defculture");
							var cultureChanged = (culture.value !== defCulture.value);
							var timeZone = this.get("timeZone");
							var currentTimeZoneCode = (timeZone) ? timeZone.code : null;
							var timeZoneChanged = (currentTimeZoneCode !== viewModel.get("deftimeZoneId"));
							var currentTimeZone = (timeZone) ? timeZone.value : null;
							if (!cultureChanged && !timeZoneChanged) {
								this.onCancel();
								return;
							}
							var changedColumns = {};
							changedColumns.Id = Terrasoft.SysValue.CURRENT_USER.value;
							if (cultureChanged) {
								changedColumns.SysCulture = culture.value;
							}
							if (timeZoneChanged) {
								changedColumns.TimeZone = currentTimeZone;
							}
							var saveCallback = function(response) {
								if (response) {
									response.message = response.UpdateOrCreateUserResult;
									response.success = Ext.isEmpty(response.message);
								}
								if (response.success) {
									if (timeZoneChanged) {
										this.showInformationDialog(
											resources.localizableStrings.childChangeTimeZoneMessage,
											this.onCancel
										);
									} else {
										this.onCancel();
									}
								}
							};
							var config = {
								serviceName: "UserProfileEditService",
								methodName: "UpdateUserProfile",
								callback: saveCallback,
								scope: this,
								data: {
									jsonObject: Ext.encode(changedColumns)
								}
							};
							ServiceHelper.callService(config, this);
						}
					},
					passwordClick: function() {
						var passwordModule = "ChangePasswordModule";
						sandbox.publish("PushHistoryState", {hash: passwordModule});
					},
					setupCallCentreParameters: function() {
						var callCentreParametersModule = "SetupTelephonyParametersPageModule";
						sandbox.publish("PushHistoryState", {hash: callCentreParametersModule});
					},
					socialClick: function() {
						var socialModule = "SocialAccountModule";
						sandbox.publish("PushHistoryState", {hash: socialModule});
					},
					mailClick: function() {
						var mailModule = "MailboxSynchronizationSettingsModule";
						sandbox.publish("PushHistoryState", {hash: mailModule});
					},
					openCommandsGrid: function() {
						var contactFiler = Terrasoft.createFilterGroup();
						contactFiler.name = "contactFiler";
						contactFiler.logicalComparisonTypes = Terrasoft.LogicalOperatorType.AND;
						var filter = Terrasoft.createColumnFilterWithParameter(
							Terrasoft.ComparisonType.EQUAL, "CreatedBy",
							Terrasoft.SysValue.CURRENT_USER_CONTACT.value);
						contactFiler.addItem(filter);
						var config = {
							entitySchemaName: "Macros",
							mode: "editMode",
							multiSelect: false,
							columnName: "Name",
							filters: contactFiler,
							cardCustomConfig: {
								cardSchema: "MacrosPageModule"
							},
							methods: {
								onDeleted: function() {
									callServiceMethod("ClearCache", function() {
											storageUtilities.clearStorage(
												storageUtilities.ClearStorageModes.GROUP, "CommandLineStorage");
											sandbox.publish("ChangeCommandList");
										},
										{
											"cacheArray": ["VwCommandActionCache", "CommandParamsCache"]
										});
								}
							}
						};
						var handler = function() {};
						LookupUtilities.Open(sandbox, config, handler, this);
					},
					onPrepareLanguageList: function() {
						var cultureSelect = Ext.create("Terrasoft.EntitySchemaQuery", {rootSchemaName: "SysCulture"});
						cultureSelect.addColumn("Id");
						cultureSelect.addColumn("Name");
						cultureSelect.getEntityCollection(function(response) {
							var list = this.get("languageList");
							if (response.success) {
								var responseItems = response.collection.getItems();
								var columnList = {};
								Terrasoft.each(responseItems, function(item) {
									columnList[item.get("Id")] = {
										value: item.get("Id"),
										displayValue: item.get("Name")
									};
								});
								list.clear();
								list.loadAll(columnList);
							}
						}, this);
					},
					onPrepareTimeZoneList: function() {
						var cultureSelect = Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "TimeZone"
						});
						cultureSelect.addColumn("Id");
						cultureSelect.addColumn("Name");
						cultureSelect.addColumn("Code");
						cultureSelect.getEntityCollection(function(response) {
							var list = this.get("timeZoneList");
							if (response.success) {
								var responseItems = response.collection.getItems();
								var columnList = {};
								Terrasoft.each(responseItems, function(item) {
									columnList[item.get("Id")] = {
										value: item.get("Id"),
										displayValue: item.get("Name"),
										code: item.get("Code")
									};
								});
								list.clear();
								list.loadAll(columnList);
							}
						}, this);
					},
					flashToDefault: function() {
						this.showConfirmationDialog(resources.localizableStrings.childOnFlashWarning, function(returnCode) {
							if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
								var query = Ext.create("Terrasoft.DeleteQuery", {
									rootSchemaName: "SysProfileData"
								});
								var currentUserContactId = Terrasoft.SysValue.CURRENT_USER_CONTACT.value;
								var filter = Terrasoft.createColumnFilterWithParameter(
									Terrasoft.ComparisonType.EQUAL, "Contact", currentUserContactId);
								query.filters.addItem(filter);
								query.execute(this.onFlashed, this);
							}
						}, ["yes", "no"]);
					},
					onFlashed: function(response) {
						if (response && response.success) {
							this.showConfirmationDialog(resources.localizableStrings.childFlashSuccessful,
								function(returnCode) {
									if (returnCode === Terrasoft.MessageBoxButtons.CLOSE.returnCode) {
										window.location.reload();
									}
								});
						} else {
							this.showConfirmationDialog(resources.localizableStrings.childOnFlashError);
						}
					},
					/**
					 * Выполняет запрос на разрешение нотификации и устанавливает соответствующий заголовок кнопке.
					 * @public
					 */
					requestNotificationPermission: function() {
						var scope = this;
						DesktopPopupNotification.requestPermission(function() {
							var buttonCaption = getNotificationButtonCaption();
							var buttonEnabled = (DesktopPopupNotification.getPermissionLevel() ===
								DesktopPopupNotification.PermissionType.DEFAULT);
							scope.set("notificationButtonCaption", buttonCaption);
							scope.set("notificationButtonEnabled", buttonEnabled);
						});
					},
					isLanguageSelectionVisible: function() {
						return (this.get("visibleByBuildType") && !this.get("isSsp"));
					},
					isTimezoneSelectionVisible: function() {
						return (this.get("visibleByBuildType") && !this.get("isSsp"));
					},
					isCommandLineSettingsVisible: function() {
						return !this.get("isSsp");
					},
					isDefaultSettingsButtonVisible: function() {
						return !this.get("isSsp");
					},
					isCallCentreSettingsVisible: function() {
						return !this.get("isSsp");
					},
					isSyncSettingsVisible: function() {
						return (this.get("visibleByBuildType") && !this.get("isSsp"));
					},
					isNotificationsSettingsVisible: function() {
						return (this.get("isNotificationsSupported") && !this.get("isSsp"));
					}
				}
			});
		};

		function generateMainView() {
			var buttonsConfig = {
				className: "Terrasoft.Container",
				id: "buttonsMenu",
				classes: {wrapClassName: ["buttons-menu-container"]},
				selectors: {wrapEl: "#buttonsMenu"},
				items: [
					{
						className: "Terrasoft.Button",
						caption: resources.localizableStrings.childSaveButtonCaption,
						click: {
							bindTo: "onClick"
						},
						style: Terrasoft.controls.ButtonEnums.style.GREEN,
						classes: {
							textClass: ["profile-save-button"]
						}
					},
					{
						className: "Terrasoft.Button",
						caption: resources.localizableStrings.childCancelButtonCaption,
						click: {
							bindTo: "onCancel"
						}
					}
				]
			};
			var leftPanelConfig = {
				className: "Terrasoft.Container",
				id: "left-container",
				classes: {
					wrapClassName: [
						"left-container"
					]
				},
				selectors: {
					wrapEl: "#left-container"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "leftTopGroupContainer",
						selectors: {
							wrapEl: "#leftTopGroupContainer"
						},
						classes: {
							wrapClassName: [
								"profile-module-left-container-bottom-border"
							]
						},
						items: [
							{
								className: "Terrasoft.Button",
								tag: "password",
								caption: resources.localizableStrings.childChangePasswordCaption,
								classes: {
									textClass: "profile-button"
								},
								click: {
									bindTo: "passwordClick"
								}
							},
							{
								className: "Terrasoft.Label",
								caption: resources.localizableStrings.childLanguageCaption,
								classes: {
									labelClass: "controlCaption"
								},
								visible: {
									bindTo: "isLanguageSelectionVisible"
								}
							},
							{
								className: "Terrasoft.ComboBoxEdit",
								value: {
									bindTo: "culture"
								},
								list: {
									bindTo: "languageList"
								},
								prepareList: {
									bindTo: "onPrepareLanguageList"
								},
								visible: {
									bindTo: "isLanguageSelectionVisible"
								},
								classes: {
									wrapClass: ["language-combo-box-edit-wrap"]
								},
								markerValue: "culture-value"
							},
							{
								className: "Terrasoft.Label",
								caption: SysAdminUnit.columns.TimeZoneId.caption,
								classes: {
									labelClass: "controlCaption"
								},
								visible: {
									bindTo: "isTimezoneSelectionVisible"
								}
							},
							{
								className: "Terrasoft.ComboBoxEdit",
								value: {
									bindTo: "timeZone"
								},
								list: {
									bindTo: "timeZoneList"
								},
								prepareList: {
									bindTo: "onPrepareTimeZoneList"
								},
								visible: {
									bindTo: "isTimezoneSelectionVisible"
								},
								markerValue: "time-zone-value"
							},
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.childMyCommandsCaption,
								tag: "myCommands",
								classes: {
									textClass: "profile-button"
								},
								click: {
									bindTo: "openCommandsGrid"
								},
								visible: {
									bindTo: "isCommandLineSettingsVisible"
								}
							},
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.SetupCallCentreParameters,
								markerValue: "callCentreSetup",
								tag: "callCentreSetup",
								classes: {
									textClass: "profile-button"
								},
								click: {
									bindTo: "setupCallCentreParameters"
								},
								visible: {
									bindTo: "isCallCentreSettingsVisible"
								}
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "leftMiddleGroupContainer",
						selectors: {
							wrapEl: "#leftMiddleGroupContainer"
						},
						classes: {
							wrapClassName: [
								"profile-module-left-container-bottom-border"
							]
						},
						visible: {
							bindTo: "isSyncSettingsVisible"
						},
						items: [
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.childMailboxesCaption,
								classes: {
									textClass: "profile-button"
								},
								click: {
									bindTo: "mailClick"
								}
							},
							{
								className: "Terrasoft.Button",
								caption: resources.localizableStrings.childSocialNetworkAccountsCaption,
								classes: {
									textClass: "profile-button"
								},
								click: {
									bindTo: "socialClick"
								},
								markerValue: "SocialAccountsButton"
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "notificationGroupContainer",
						selectors: {
							wrapEl: "#notificationGroupContainer"
						},
						classes: {
							wrapClassName: [
								"profile-module-left-container-bottom-border"
							]
						},
						visible: {
							bindTo: "isNotificationsSettingsVisible"
						},
						items: [
							{
								className: "Terrasoft.Button",
								caption: {
									bindTo: "notificationButtonCaption"
								},
								classes: {
									textClass: "profile-button"
								},
								enabled: {
									bindTo: "notificationButtonEnabled"
								},
								click: {
									bindTo: "requestNotificationPermission"
								}
							}
						]
					},
					{
						className: "Terrasoft.Button",
						caption: resources.localizableStrings.childDefaultSettingsCaption,
						tag: "default",
						classes: {
							textClass: "profile-button"
						},
						click: {
							bindTo: "flashToDefault"
						},
						visible: {
							bindTo: "isDefaultSettingsButtonVisible"
						}
					}
				]
			};
			var resultConfig = Ext.create("Terrasoft.Container", {
				id: "topContainer",
				selectors: {
					wrapEl: "#topContainer"
				},
				classes: {wrapClassName: ["profile-module"]},
				items: [
					buttonsConfig,
					leftPanelConfig
				]

			});
			return resultConfig;
		}

		var render = function(renderTo) {
			MaskHelper.HideBodyMask();
			var headerCaption = Ext.String.format(resources.localizableStrings.childHeaderCaption,
				Terrasoft.SysValue.CURRENT_USER_CONTACT.displayValue);
			sandbox.publish("ChangeHeaderCaption", {
				caption: headerCaption,
				dataViews: new Terrasoft.Collection()
			});
			sandbox.subscribe("NeedHeaderCaption", function() {
				sandbox.publish("InitDataViews", { caption: headerCaption });
			}, this);
			container = renderTo;
			getCulture();
			loadHeader(renderTo);
		};

		var init = function() {
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
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
			loadContextHelp("1012");
		};

		return {
			init: init,
			render: render
		};
	}
);