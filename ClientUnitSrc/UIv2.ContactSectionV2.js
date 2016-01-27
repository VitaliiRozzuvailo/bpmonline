define("ContactSectionV2", ["GridUtilitiesV2", "GoogleIntegrationUtilities", "RightUtilities",
	"ConfigurationConstants"],
function(gridUtilitiesV2, GoogleUtilities, RightUtilities, ConfigurationConstants) {
	return {
		entitySchemaName: "Contact",
		attributes: {
			"canUseGoogleOrSocialFeaturesByBuildType": {
				dataValueType: this.Terrasoft.DataValueType.BOOLEAN,
				value: false
			}
		},
		messages: {
			/**
			 * @message GetMapsConfig
			 * Определяет параметры, необходимые при показе адреса объекта на карте.
			 * @param {Object} Параметры, используемые для показа адреса объекта на карте.
			 */
			"GetMapsConfig": {
				mode: Terrasoft.MessageMode.PTP,
				direction: Terrasoft.MessageDirectionType.SUBSCRIBE
			}
		},
		methods: {
			/**
			 * @overridden
			 */
			init: function() {
				this.checkCanSearchDuplicates();
				this.set("GridType", "tiled");
				this.callParent(arguments);
				var sysSettings = ["BuildType"];
				Terrasoft.SysSettings.querySysSettings(sysSettings, function() {
					var buildType = Terrasoft.SysSettings.cachedSettings.BuildType &&
						Terrasoft.SysSettings.cachedSettings.BuildType.value;
					this.set("canUseGoogleOrSocialFeaturesByBuildType", buildType !==
						ConfigurationConstants.BuildType.Public);
				}, this);
			},

			/**
			 * @overridden
			 */
			initContextHelp: function() {
				this.set("ContextHelpId", 1002);
				this.callParent(arguments);
			},

			/**
			 * Проверяет есть ли у пользователя право на поиск дублей.
			 * согласно системной настройке "Поиск дублей" (CanSearchDuplicates).
			 * @overridden
			 * @returns {Boolean} Возвращает результат: есть ли у пользователя право на поиск дублей.
			 */
			checkCanSearchDuplicates: function() {
				RightUtilities.checkCanExecuteOperation({
					operation: "CanSearchDuplicates"
				}, function(result) {
					this.set("canSearchDuplicates", result);
				}, this);
			},

			/**
			 * Действие "Показать на карте".
			 */
			openShowOnMap: function() {
				var items = this.getSelectedItems();
				var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "Contact"
				});
				select.addColumn("Id");
				select.addColumn("Name");
				select.addColumn("Address");
				select.addColumn("City");
				select.addColumn("Region");
				select.addColumn("Country");
				select.addColumn("GPSN");
				select.addColumn("GPSE");
				select.filters.add("ContactIdFilter", this.Terrasoft.createColumnInFilterWithParameters("Id", items));
				select.getEntityCollection(function(result) {
					if (result.success) {
						var mapsConfig = {
							mapsData: []
						};
						result.collection.each(function(item) {
							var address = [];
							var country = item.get("Country");
							if (country && country.displayValue) {
								address.push(country.displayValue);
							}
							var region = item.get("Region");
							if (region && region.displayValue) {
								address.push(region.displayValue);
							}
							var city = item.get("City");
							if (city && city.displayValue) {
								address.push(city.displayValue);
							}
							address.push(item.get("Address"));
							var name = item.get("Name");
							var dataItem = {
								caption: name,
								content: "<h2>" + name + "</h2><div>" + address.join(", ") + "</div>",
								address: item.get("Address") ? address.join(", ") : null,
								gpsN: item.get("GPSN"),
								gpsE: item.get("GPSE"),
								updateCoordinatesConfig: {
									schemaName: "Contact",
									id: item.get("Id")
								}
							};
							mapsConfig.mapsData.push(dataItem);
						});
						var mapsModuleSandboxId = this.sandbox.id + "_MapsModule" + this.Terrasoft.generateGUID();
						this.sandbox.subscribe("GetMapsConfig", function() {
							return mapsConfig;
						}, [mapsModuleSandboxId]);
						this.sandbox.loadModule("MapsModule", {
							id: mapsModuleSandboxId,
							keepAlive: true
						});
					}
				}, this);
			},

			/**
			 * Действие "Найти дубли".
			 */
			openDuplicatesModule: function() {
				this.sandbox.publish("PushHistoryState", {hash: "DuplicatesModule/Contact"});
			},

			/**
			 * Действие "Синхронизировать с контактами Google".
			 */
			synchronizeWithGoogleContacts: function() {
				this.showBodyMask();
				if (this.entitySchema.name !== "Contact") {
					return;
				}
				this.Terrasoft.SysSettings.querySysSettingsItem("GoogleContactGroup", function(value) {
					if (!value) {
						this.showInformationDialog(this.get("Resources.Strings.FolderNotSet"));
						this.hideBodyMask();
						return;
					}
					var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: "ContactTag"
					});
					esq.addColumn("Id");
					var filters = this.Ext.create("Terrasoft.FilterGroup");
					var recordId = (this.Ext.isObject(value)) ? value.value : value;
					filters.addItem(esq.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"Id", recordId));
					esq.filters = filters;
					esq.getEntityCollection(function(result) {
						var collection = result.collection;
						if (this.Ext.isEmpty(collection) || (collection.collection.getCount() === 0)) {
							this.showInformationDialog(this.get("Resources.Strings.FolderNotSet"));
							this.hideBodyMask();
							return;
						}
						var requestUrl = this.Terrasoft.workspaceBaseUrl + "/ServiceModel/ProcessEngineService.svc/" +
							"SynchronizeContactsWithGoogleModuleProcess/Execute?ResultParameterName=SyncResult";
						this.Ext.Ajax.request({
							url: requestUrl,
							headers: {
								"Content-Type": "application/json",
								"Accept": "application/json"
							},
							method: "POST",
							scope: this,
							timeout: 120000,
							callback: function(request, success, response) {
								var messageFail;
								if (success) {
									var responseValue = this.Ext.isIE8 || this.Ext.isIE9 ?
										response.responseXML.firstChild.text :
										response.responseXML.firstChild.textContent;
									var responseData = this.Ext.decode(this.Ext.decode(responseValue));
									if (this.Ext.isEmpty(responseData)) {
										messageFail = this.get("Resources.Strings.SyncProcessFail");
									} else if (responseData.addedRecordsInBPMonlineCount) {
										this.set("IsClearGridData", true);
										this.set("ActiveRow", null);
										this.loadGridData();
										var message = this.get("Resources.Strings.SynchronizeWithGoogleSyncResult");
										var messageArr = message.split("{NewLine}");
										message = messageArr.join("\n");
										message = this.Ext.String.format(
											message,
											responseData.addedRecordsInBPMonlineCount,
											responseData.updatedRecordsInBPMonlineCount,
											responseData.deletedRecordsInBPMonlineCount,
											responseData.addedRecordsInGoogleCount,
											responseData.updatedRecordsInGoogleCount,
											responseData.deletedRecordsInGoogleCount
										);
										this.Terrasoft.utils.showInformation(message, null, null, {buttons: ["ok"]});
									} else if (responseData.settingsNotSet) {
										messageFail = this.get("Resources.Strings.SettingsNotSet");
									} else if (responseData.AuthenticationErrorMessage) {
										GoogleUtilities.showGoogleAuthenticationWindow(function() {
											Terrasoft.utils.showInformation(
												GoogleUtilities.localizableStrings.SettingSavedNeedRestart);
										});
									} else {
										messageFail = this.get("Resources.Strings.SyncProcessFail");
									}
								} else if (response.timedout) {
									messageFail = this.get("Resources.Strings.SyncProcessTimedOut");
								} else {
									messageFail = this.get("Resources.Strings.CallbackFailed");
								}
								this.hideBodyMask();
								if (messageFail) {
									this.Terrasoft.utils.showInformation(messageFail, null, null, {buttons: ["ok"]});
								}
							}
						});
					}, this);
				}, this);
			},

			/**
			 * Действие "Настроить синхронизацию с Google".
			 */
			openGoogleSettingsPage: function() {
				this.sandbox.publish("PushHistoryState", {
					hash: "GoogleIntegrationSettingsModule/",
					stateObj: {
						schema: "Contact"
					}
				});
			},

			/**
			 * @obsolete
			 */
			fillContactWithSocialNetworksData: function() {
				var activeRowId = this.get("ActiveRow");
				var selectedRowIds = this.get("SelectedRows");
				if (!activeRowId) {
					if (selectedRowIds.length > 0) {
						activeRowId = selectedRowIds[0];
					}
				}
				var confirmationMessage = this.get("Resources.Strings.OpenContactCardQuestion");
				var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "Contact"
				});
				esq.addColumn("FacebookId");
				esq.addColumn("LinkedInId");
				esq.addColumn("TwitterId");
				var filters = this.Ext.create("Terrasoft.FilterGroup");
				filters.addItem(esq.createColumnFilterWithParameter(this.Terrasoft.ComparisonType.EQUAL,
						"Id", activeRowId));
				esq.filters = filters;
				esq.getEntity(activeRowId, function(result) {
					if (result.success && result.entity) {
						var entity = result.entity;
						var facebookId = entity.get("FacebookId");
						var linkedInId = entity.get("LinkedInId");
						var twitterId = entity.get("TwitterId");
						if (facebookId !== "" || linkedInId !== "" || twitterId !== "") {
							this.sandbox.publish("PushHistoryState", {
								hash: "FillContactWithSocialAccountDataModule",
								stateObj: {
									FacebookId: facebookId,
									LinkedInId: linkedInId,
									TwitterId: twitterId,
									ContactId: activeRowId
								}
							});
						} else {
							this.Terrasoft.utils.showConfirmation(confirmationMessage,
									function getSelectedButton(returnCode) {
										if (returnCode === this.Terrasoft.MessageBoxButtons.YES.returnCode) {
											this.editRecord(activeRowId);
											if (!this.get("ActiveRow") && selectedRowIds.length > 0) {
												this.unSetMultiSelect();
											}
										}
									}, ["yes", "no"], this, null);
						}
					}
				}, this);
			},

			/**
			 * Возвращает коллекцию действий раздела в режиме отображения реестра.
			 * @protected
			 * @overridden
			 * @return {Terrasoft.BaseViewModelCollection} Возвращает коллекцию действий раздела в режиме.
			 * отображения реестра
			 */
			getSectionActions: function() {
				var actionMenuItems = this.callParent(arguments);
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: ""
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Click": {"bindTo": "openShowOnMap"},
					"Caption": {"bindTo": "Resources.Strings.ShowOnMapActionCaption"},
					"Enabled": {"bindTo": "isAnySelected"}
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Click": {"bindTo": "openDuplicatesModule"},
					"Caption": {"bindTo": "Resources.Strings.DuplicatesActionCaption"},
					"Visible": {"bindTo": "canSearchDuplicates"}
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					Type: "Terrasoft.MenuSeparator",
					Caption: "",
					"Visible": {"bindTo": "canUseGoogleOrSocialFeaturesByBuildType"}
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Click": {"bindTo": "synchronizeWithGoogleContacts"},
					"Caption": {"bindTo": "Resources.Strings.SynchronizeWithGoogleContactsActionCaption"},
					"Visible": {"bindTo": "canUseGoogleOrSocialFeaturesByBuildType"}
				}));
				actionMenuItems.addItem(this.getButtonMenuItem({
					"Click": {"bindTo": "openGoogleSettingsPage"},
					"Caption": {"bindTo": "Resources.Strings.OpenGoogleSettingsPageActionCaption"},
					"Visible": {"bindTo": "canUseGoogleOrSocialFeaturesByBuildType"}
				}));
				return actionMenuItems;
			}
		}
	};
});
