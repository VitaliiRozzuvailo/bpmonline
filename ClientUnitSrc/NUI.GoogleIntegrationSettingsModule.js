define("GoogleIntegrationSettingsModule", ["ext-base", "terrasoft", "sandbox", "ConfigurationConstants",
		"GoogleIntegrationUtilities", "GoogleIntegrationSettingsModuleResources", "TagConstantsV2"],
	function(Ext, Terrasoft, sandbox, ConfigurationConstants, googleUtilities, resources, TagConstants) {
		var staticGroups = {};
		var view, viewModel;
		var schema = "Contact";
		var JobName, SyncProcessName, GoogleSynchInterval, GoogleLastSynchronization, GoogleLastSynchronizationEnd;
		var SyncJobGroupName = "GoogleIntegration";

		function setSchema() {
			var history = sandbox.publish("GetHistoryState");
			if (history.state) {
				schema = history.state.schema === "Activity" ? "Activity" : "Contact";
				JobName = history.state.schema === "Activity" ? "SynchGoogleCalendar" : "SynchGoogleContacts";
				SyncProcessName = history.state.schema === "Activity" ?
					"GCalendarSynchronizationModuleProcess" : "GContactSynchronizationModuleProcess";
				GoogleSynchInterval = history.state.schema === "Activity" ?
					"GoogleCalendarSynchInterval" : "GoogleContactSynchInterval";
				GoogleLastSynchronization = (schema === "Activity") ?
					"GoogleCalendarLastSynchronization" : "GoogleContactLastSynchronization";
				GoogleLastSynchronizationEnd = (schema === "Activity") ?
					"GoogleCalendarLastSynchronizationEnd" : "GoogleContactLastSynchronizationEnd";
			}
		}

		function setTagSelectedItemById(id) {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "ContactTag"
			});
			select.addColumn("Id");
			select.addColumn("Name");
			select.getEntity(id, function(response) {
				var entity = response.entity;
				if (entity) {
					var value = {value: entity.get("Id"), displayValue: entity.get("Name")};
					viewModel.set("tagValue", value);
				}
			}, this);
		}

		function getPrivateTags() {
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "ContactTag"
			});
			select.addColumn("Id");
			select.addColumn("Name");
			select.filters.add("privateTagFilter", select.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "Type", TagConstants.TagType.Private));
			select.filters.add("CurrentUserFilter", select.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, "CreatedBy", this.Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
			select.getEntityCollection(fillPrivateTags, this);
		}

		function fillPrivateTags(response) {
			var entities = response.collection;
			entities.each(function(item) {
				staticGroups[item.get("Id")] = {value: item.get("Id"), displayValue: item.get("Name")};
			}, this);
		}

		function authLogin() {
			googleUtilities.showGoogleAuthenticationWindow(setLoginControl);
		}

		function setAutoSyncState(jobName, syncJobGroupName) {
			var provider = Terrasoft.AjaxProvider;
			var data = {
				JobName: jobName,
				SyncJobGroupName: syncJobGroupName
			};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/SchedulerJobService/CheckIfJobExist";
			provider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function(request, success, response) {
					var ifExistResult = false;
					if (success) {
						ifExistResult = Terrasoft.decode(response.responseText);
						viewModel.set("isAutoSync", ifExistResult.CheckIfJobExistResult);
					}
				},
				scope: this
			});
		}

		/**
		 * Устанавливает свойство модели login.
		 * @param {String} login (optional) Логин учетной записи Google.
		 * @public
		 */
		function setLoginControl(login) {
			if (!Ext.isEmpty(login)) {
				viewModel.set("login", login);
				viewModel.set("enabledLogin", false);
				return;
			}
			var select = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "SocialAccount"
			});
			select.addColumn("Login");
			select.filters.add("UserIdFilter", select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"User", Terrasoft.SysValue.CURRENT_USER.value));
			select.filters.add("TypeIdFilter", select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"Type", ConfigurationConstants.CommunicationType.Google));
			select.getEntityCollection(function(response) {
				if (response.success) {
					var entities = response.collection;
					if (entities.getCount() > 0) {
						login = entities.getByIndex(0).get("Login");
						viewModel.set("login", login);
						viewModel.set("enabledLogin", false);
					}
				}
			}, this);
		}

		function createScheduledJob(returnBack) {
			var provider = Terrasoft.AjaxProvider;
			var data = {
				JobName: JobName + Terrasoft.SysValue.CURRENT_USER.value,
				SyncJobGroupName: SyncJobGroupName,
				SyncProcessName: SyncProcessName,
				periodInMinutes: viewModel.get("googleSyncInterval"),
				recreate: viewModel.get("isAutoSync")
			};
			var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/SchedulerJobService/CreateSyncJob";
			provider.request({
				url: requestUrl,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				method: "POST",
				jsonData: data,
				callback: function() {
					if (returnBack) {
						sandbox.publish("BackHistoryState");
					}
				},
				scope: this
			});
		}

		function initModel() {
			var isActivity = (schema === "Activity");
			viewModel.set("isGroupVisible", !isActivity);
			viewModel.set("autoSyncCaption", isActivity ?
				resources.localizableStrings.ActivityAutoSyncCaption :
				resources.localizableStrings.ContactAutoSyncCaption);
			viewModel.columns.tagValue.isRequired = !isActivity;
			setLoginControl();
			setAutoSyncState(JobName + Terrasoft.SysValue.CURRENT_USER.value, SyncJobGroupName);
			Terrasoft.SysSettings.querySysSettingsItem(GoogleLastSynchronization, function(value) {
				viewModel.set("googleSyncDate", value);
				viewModel.set("googleSyncTime", value);
			}, this);
			Terrasoft.SysSettings.querySysSettingsItem(GoogleSynchInterval, function(value) {
				if (value) {
					viewModel.set("googleSyncInterval", value);
				}
			}, this);
			if (schema === "Contact") {
				Terrasoft.SysSettings.querySysSettingsItem("GoogleContactGroup", function(value) {
					if (value) {
						var recordId = (Ext.isObject(value)) ? value.value : value;
						setTagSelectedItemById(recordId);
					}
				}, this);
			}
		}

		function getView() {
			var container = Ext.create("Terrasoft.Container", {
				id: "generalContainer",
				selectors: {
					wrapEl: "#generalContainer"
				},
				items: [
					{
						className: "Terrasoft.Container",
						id: "buttonsContainer",
						selectors: {
							wrapEl: "#buttonsContainer"
						},
						classes: {
							wrapClassName: ["buttons-container"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "btnOkContainer",
								selectors: {
									wrapEl: "#btnOkContainer"
								},
								classes: {
									wrapClassName: ["btnOk-container"]
								},
								items: [
									{
										className: "Terrasoft.Button",
										id: "btnOk",
										caption: resources.localizableStrings.BtnOKCaption,
										width: "100px",
										style: Terrasoft.controls.ButtonEnums.style.GREEN,
										click: {
											bindTo: "onOkBtnClick"
										}
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "btnCancelContainer",
								selectors: {
									wrapEl: "#btnCancelContainer"
								},
								classes: {
									wrapClassName: ["btnCancel-container"]
								},
								items: [
									{
										className: "Terrasoft.Button",
										id: "btnCancel",
										caption: resources.localizableStrings.BtnCancelCaption,
										width: "100px",
										style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
										click: {
											bindTo: "onCancelBtnClick"
										}
									}
								]
							}

						]
					},
					{
						className: "Terrasoft.Container",
						id: "userLoginContainer",
						selectors: {
							wrapEl: "#userLoginContainer"
						},
						classes: {
							wrapClassName: ["userlogin-container"]
						},
						items: [
							{
								className: "Terrasoft.Label",
								id: "userLoginLabel",
								caption: resources.localizableStrings.UserLoginCaption,
								classes: {
									labelClass: ["required-caption"]
								}
							},
							{
								className: "Terrasoft.TextEdit",
								id: "userLogin",
								value: {
									bindTo: "login"
								},
								enabled: false,
								classes: {
									wrapperClass: "userLogin-right-icon"
								},
								rightIconConfig: {
									source: Terrasoft.ImageSources.URL,
									url: Terrasoft.ImageUrlBuilder.getUrl(resources.localizableImages.LookUpIcon)
								},
								enableRightIcon: true,
								onRightIconClick: authLogin
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "groupContainer",
						selectors: {
							wrapEl: "#groupContainer"
						},
						classes: {
							wrapClassName: ["group-container"]
						},
						visible: {bindTo: "isGroupVisible"},
						items: [
							{
								className: "Terrasoft.Label",
								id: "groupLabel",
								caption: resources.localizableStrings.TagCaption,
								classes: {
									labelClass: ["required-caption"]
								}
							},
							{
								className: "Terrasoft.ComboBoxEdit",
								id: "group",
								value: {
									bindTo: "tagValue"
								},
								list: {
									bindTo: "tagList"
								},
								prepareList: {
									bindTo: "onPrepareTagList"
								}
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "autosyncContainer",
						selectors: {
							wrapEl: "#autosyncContainer"
						},
						classes: {
							wrapClassName: ["autosync-container"]
						},
						items: [
							{
								className: "Terrasoft.Container",
								id: "autosyncCheckBoxLabelContainer",
								selectors: {
									wrapEl: "#autosyncCheckBoxLabelContainer"
								},
								classes: {
									wrapClassName: ["autosync-checkboxedit-label-container"]
								},
								items: [
									{
										className: "Terrasoft.Container",
										id: "autosyncCheckBoxContainer",
										selectors: {
											wrapEl: "#autosyncCheckBoxContainer"
										},
										classes: {
											wrapClassName: ["autosync-checkboxedit-container"]
										},
										items: [
											{
												className: "Terrasoft.CheckBoxEdit",
												id: "autoSync",
												classes: {
													wrapClass: ["autosync-checkboxedit"]
												},
												checked: {
													bindTo: "isAutoSync"
												}
											}
										]
									},
									{
										className: "Terrasoft.Container",
										id: "autosyncLabelContainer",
										selectors: {
											wrapEl: "#autosyncLabelContainer"
										},
										classes: {
											wrapClassName: ["autosync-label-container"]
										},
										items: [
											{
												className: "Terrasoft.Label",
												id: "autoSyncLabel",
												caption: {
													bindTo: "autoSyncCaption"
												},
												labelClass: "t-label autosync-label"
											}
										]
									}
								]
							},
							{
								className: "Terrasoft.Container",
								id: "minutesTextEditLabelContainer",
								selectors: {
									wrapEl: "#minutesTextEditLabelContainer"
								},
								classes: {
									wrapClassName: ["minutes-textedit-label-container"]
								},
								items: [
									{
										className: "Terrasoft.Container",
										id: "minutesTextEditContainer",
										selectors: {
											wrapEl: "#minutesTextEditContainer"
										},
										classes: {
											wrapClassName: ["minutes-textedit-container"]
										},
										items: [
											{
												className: "Terrasoft.TextEdit",
												id: "minutes",
												classes: {
													wrapClass: ["minutes-textedit"]
												},
												value: {
													bindTo: "googleSyncInterval"
												}
											}
										]
									},
									{
										className: "Terrasoft.Container",
										id: "minutesLabelContainer",
										selectors: {
											wrapEl: "#minutesLabelContainer"
										},
										classes: {
											wrapClassName: ["minutes-label-container"]
										},
										items: [
											{
												className: "Terrasoft.Label",
												id: "minutesLabel",
												caption: resources.localizableStrings.MinutesCaption,
												labelClass: "t-label minutes-label"
											}
										]
									}
								]
							}
						]
					},
					{
						className: "Terrasoft.Container",
						id: "lastSyncDateContainer",
						selectors: {
							wrapEl: "#lastSyncDateContainer"
						},
						classes: {
							wrapClassName: ["lastSyncDate-container", "flex-container"]
						},
						items: [
							{
								className: "Terrasoft.Label",
								id: "GoogleSyncDateLabel",
								caption: resources.localizableStrings.SyncFromDateCaption,
								classes: {
									labelClass: ["required-caption"]
								}
							},
							{
								className: Terrasoft.DateEdit,
								id: "GoogleSyncDateEdit",
								visible: true,
								value: {
									bindTo: "googleSyncDate"
								}
							},
							{
								className: Terrasoft.TimeEdit,
								classes: {
									wrapClass: ["googleSync-timeEdit"]
								},
								id: "GoogleSyncTimeEdit",
								visible: true,
								value: {
									bindTo: "googleSyncTime"
								}
							}
						]
					}
				]
			});
			return container;
		}

		function getViewModel() {
			var viewModel = Ext.create("Terrasoft.BaseViewModel", {
				columns: {
					login: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "login",
						isRequired: true
					},
					tagValue: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "tagValue",
						isLookup: true,
						isRequired: true
					},
					tagList: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						name: "tagList",
						isCollection: true
					},
					googleSyncDate: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						dataValueType: Terrasoft.DataValueType.DATE,
						name: "googleSyncDate",
						isRequired: true
					},
					googleSyncTime: {
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						dataValueType: Terrasoft.DataValueType.DATE,
						name: "googleSyncTime",
						isRequired: true
					}
				},
				values: {
					tagList: new Terrasoft.Collection(),
					login: null,
					enabledLogin: true,
					autoSyncCaption: "",
					googleContactGroup: "",
					googleLastSync: "",
					googleSyncDate: null,
					googleSyncTime: null,
					googleSyncInterval: "",
					isAutoSync: false,
					isGroupVisible: true
				},
				methods: {
					onOkBtnClick: function() {
						if (this.validate()) {
							var minutesValue = viewModel.get("googleSyncInterval");
							Terrasoft.SysSettings.postPersonalSysSettingsValue(GoogleSynchInterval, minutesValue,
								function() {
									if (schema === "Contact") {
										var groupValue = viewModel.get("tagValue").value;
										Terrasoft.SysSettings.postPersonalSysSettingsValue("GoogleContactGroup",
											groupValue, function() {
												createScheduledJob(true);
											});
									} else {
										createScheduledJob(true);
									}
								});
							var lastSyncDateValue = new Date(viewModel.get("googleSyncDate"));
							var lastSyncTimeValue = new Date(viewModel.get("googleSyncTime"));
							var lastSyncDateTimeValue = new Date(lastSyncDateValue.getFullYear(),
								lastSyncDateValue.getMonth(), lastSyncDateValue.getDate(), lastSyncTimeValue.getHours(),
								lastSyncTimeValue.getMinutes());
							Terrasoft.SysSettings.postPersonalSysSettingsValue(GoogleLastSynchronization,
								lastSyncDateTimeValue, function(result) {
									if (result.success) {
										return;
									}
									throw new Terrasoft.InvalidOperationException(result.errorInfo.message);
								});
							Terrasoft.SysSettings.postPersonalSysSettingsValue(GoogleLastSynchronizationEnd,
								lastSyncDateTimeValue, function(result) {
									if (result.success) {
										return;
									}
									throw new Terrasoft.InvalidOperationException(result.errorInfo.message);
								});
						}
					},
					onCancelBtnClick: function() {
						sandbox.publish("BackHistoryState");
					},
					onLoginLookupClick: function() {
					},
					onPrepareTagList: function(filter, list) {
						list.clear();
						list.loadAll(staticGroups);
					},
					RightIconClick: function() {
						authLogin(this);
					},
					openLoginPage: authLogin
				}
			});
			return viewModel;
		}

		function render(renderTo) {
			var headerCaption = resources.localizableStrings.WindowCaption;
			sandbox.publish("ChangeHeaderCaption", {
				caption: headerCaption,
				dataViews: new Terrasoft.Collection()
			});
			sandbox.subscribe("NeedHeaderCaption", function() {
				sandbox.publish("InitDataViews", {caption: headerCaption});
			}, this);
			getPrivateTags();
			setSchema();
			view = getView();
			viewModel = getViewModel();
			initModel();
			view.bind(viewModel);
			view.render(renderTo);
		}

		return {
			render: render
		};
	});