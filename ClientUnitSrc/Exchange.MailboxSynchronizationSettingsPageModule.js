define("MailboxSynchronizationSettingsPageModule", ["terrasoft", "ext-base", "sandbox", "ConfigurationConstants",
		"LookupUtilities", "MailboxSynchronizationSettingsPageModuleResources", "RightUtilities", "MaskHelper",
		"ExchangeNUIConstants", "EmailHelper"],
	function(Terrasoft, Ext, sandbox, ConfigurationConstants, LookupUtilities, resources, RightUtilities, MaskHelper,
			ExchangeNUIConstants, EmailHelper) {

		Ext.define("Terrasoft.MailboxSynchronizationSettingsPageModule", {

			/**
			 * @private
			 * @param {String} caption
			 * @param {String} labelClass
			 * @param {Function} bindTo
			 * @return {Object}
			 */
			getLabelConfig: function(caption, labelClass, bindTo) {
				var label = {
					className: "Terrasoft.Label",
					caption: caption
				};
				if (!Ext.isEmpty(labelClass)) {
					label.labelClass = labelClass;
				}
				if (!Ext.isEmpty(bindTo)) {
					label.click = {
						bindTo: bindTo
					};
				}
				return label;
			},

			/**
			 * @private
			 * @param {String} id
			 * @param {String} stylesClass
			 * @return {Object}
			 */
			getContainerConfig: function(id, stylesClass) {
				var container = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: stylesClass
					},
					items: [],
					id: id,
					selectors: {
						wrapEl: "#" + id
					}
				};
				return container;
			},

			/**
			 *
			 * @param {String} value Название атрибута view model.
			 * @return {Object}
			 */
			getDateEdit: function(value) {
				var dateEdit = {
					className: "Terrasoft.DateEdit"
				};
				if (!Ext.isEmpty(value)) {
					dateEdit.value = {
						bindTo: value
					};
				}
				return dateEdit;
			},

			/**
			 *
			 * @param {String} tag Название атрибута view model.
			 * @param {String} enabled Название атрибута view model.
			 * @param {String} checked Название атрибута view model.
			 * @return {Object}
			 */
			getRadioButton: function(tag, enabled, checked) {
				var radioButton = {
					className: "Terrasoft.RadioButton",
					tag: tag
				};
				if (!Ext.isEmpty(enabled)) {
					radioButton.enabled = {
						bindTo: enabled
					};
				}
				if (!Ext.isEmpty(checked)) {
					radioButton.checked = {
						bindTo: checked
					};
				}
				return radioButton;
			},

			/**
			 * Формирует конфиг кнопки.
			 * @param {String} caption Заголовок кнопки.
			 * @param {String} click Название свойства view model.
			 * @param {String} enabled Название свойства view model.
			 * @return {Object} Конфиг кнопки.
			 */
			getButtonConfig: function(caption, click, enabled) {
				var button = {
					className: "Terrasoft.Button",
					caption: caption,
					width: "200px",
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					click: {
						bindTo: click
					}
				};
				if (!Ext.isEmpty(enabled)) {
					button.enabled = {
						bindTo: enabled
					};
				}
				return button;
			},

			/**
			 *
			 * @param {String} value Название атрибута view model.
			 * @param {String} enabled Название атрибута view model.
			 * @param {Number} width Ширина контрола.
			 * @return {Object}
			 */
			getIntegerEditConfig: function(value, enabled, width) {
				var integerEdit = {
					className: "Terrasoft.IntegerEdit"
				};
				if (!Ext.isEmpty(width)) {
					integerEdit.width = width;
				}
				if (!Ext.isEmpty(value)) {
					integerEdit.value = {
						bindTo: value
					};
				}
				if (!Ext.isEmpty(enabled)) {
					integerEdit.enabled = {
						bindTo: enabled
					};
				}
				return integerEdit;
			},

			/**
			 *
			 * @param {String} enabled Название атрибута view model.
			 * @param {String} checked Название атрибута view model.
			 * @return {Object}
			 */
			getCheckBoxEdit: function(enabled, checked) {
				var checkBox = {
					className: "Terrasoft.CheckBoxEdit"
				};
				if (!Ext.isEmpty(enabled)) {
					checkBox.enabled = {
						bindTo: enabled
					};
				}
				if (!Ext.isEmpty(checked)) {
					checkBox.checked = {
						bindTo: checked
					};
				}
				return checkBox;
			},

			/**
			 *
			 * @param {Object} params
			 * @return {Object}
			 */
			getStandardContainerWithCheckBox: function(params) {
				var mainContainer = this.getContainerConfig(params.id + "-container",
					["control-margin-bottom-container"]);
				var checkBoxContainer = this.getContainerConfig(params.id + "-checkbox-container",
					["smallcontrol-container", "inline-container", "checkbox-vertical-align"]);
				checkBoxContainer.items.push(this.getCheckBoxEdit(params.enabled, params.checked));
				var labelContainer = this.getContainerConfig(params.id + "-checkbox-label-container",
					["inline-container", "label-maxwidth400-container"]);
				labelContainer.items.push(this.getLabelConfig(params.caption));
				mainContainer.items.push(checkBoxContainer);
				mainContainer.items.push(labelContainer);
				return mainContainer;
			},

			/**
			 *
			 * @param {Object} params
			 * @return {Object}
			 */
			getStandardContainerWithDateEdit: function(params) {
				var mainContainer = this.getContainerConfig(params.id + "-container",
					["control-margin-bottom-container"]);
				var dateEditContainer = this.getContainerConfig(params.id + "-date-edit-container",
					["inline-container", "dateedit-startWithDate-container"]);
				dateEditContainer.items.push(this.getDateEdit(params.value));
				var labelContainer = this.getContainerConfig(params.id + "-label-container",
					["width50-container", "inline-container", "label-maxwidth400-container"]);
				labelContainer.items.push(this.getLabelConfig(params.caption));
				mainContainer.items.push(labelContainer);
				mainContainer.items.push(dateEditContainer);
				return mainContainer;
			},

			/**
			 *
			 * @param {Object} params
			 * @return {Object}
			 */
			getStandardContainerWithRadioButton: function(params) {
				var mainContainer = this.getContainerConfig(params.id + "-container",
					["padding-left40-container", "control-margin-bottom-container"]);
				var radioButtonContainer = this.getContainerConfig(params.id + "-radio-button-container",
					["smallcontrol-container", "inline-container", "radio-vertical-align"]);
				radioButtonContainer.items.push(this.getRadioButton(params.tag, params.enabled, params.checked));
				var labelContainer = this.getContainerConfig(params.id + "-label-container",
					["inline-container", "label-maxwidth400-container"]);
				labelContainer.items.push(this.getLabelConfig(params.caption));
				mainContainer.items.push(radioButtonContainer);
				mainContainer.items.push(labelContainer);
				return mainContainer;
			},

			/**
			 *
			 * @param {Object} params
			 * @return {Object}
			 */
			getStandardContainerWithButton: function(params) {
				var mainContainer = this.getContainerConfig(params.id + "-container",
					["inline-container"]);
				mainContainer.items.push(this.getButtonConfig(params.caption, params.click, params.enabled));
				return mainContainer;
			},

			/**
			 *
			 * @param {Object} params
			 * @return {Object}
			 */
			getStandardContainerWithIntegerEdit: function(params) {
				var mainContainer = this.getContainerConfig(params.id + "-container",
					["control-margin-bottom-container"]);
				var integerEditContainer = this.getContainerConfig(params.id + "-integeredit-container",
					["smallcontrol-container", "inline-container"]);
				integerEditContainer.items.push(this.getIntegerEditConfig(params.value, params.enabled, params.width));
				var labelContainer = this.getContainerConfig(params.id + "-integeredit-label-container",
					["inline-container", "label-maxwidth250-container"]);
				labelContainer.items.push(this.getLabelConfig(params.caption));
				mainContainer.items.push(integerEditContainer);
				mainContainer.items.push(labelContainer);
				return mainContainer;
			},

			/**
			 * Заполняет список почтовых серверов.
			 * @param {Object} scope Контекст.
			 */
			fillMailServerCollection: function(scope) {
				var select = Ext.create("Terrasoft.EntitySchemaQuery", {
					rootSchemaName: "MailServer"
				});
				select.addColumn("Id");
				select.addColumn("Name");
				select.getEntityCollection(function(response) {
					if (response.success) {
						var collection = response.collection.collection;
						var mailServerCollection = scope.get("mailServerCollection");
						Terrasoft.each(collection.items, function(element) {
							mailServerCollection[element.get("Id")] = {
								value: element.get("Id"),
								displayValue: element.get("Name")
							};
						}, this);
					}
				}, scope);
			},

			/**
			 *
			 * @return {Array}
			 */
			getEmailDownloadItems: function() {
				var items = [];
				items.push({
					className: "Terrasoft.Container",
					id: "useEmailDownloadContainer",
					selectors: {
						wrapEl: "#useEmailDownloadContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "useEmailDownloadCheckBoxContainer",
							selectors: {
								wrapEl: "#useEmailDownloadCheckBoxContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "checkbox-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.CheckBoxEdit",
									markerValue: resources.localizableStrings.UseEmailDownloadCaptionEx,
									id: "useEmailDownload",
									checked: {
										bindTo: "enableMailSynchronization",
										bindConfig: {
											converter: function(value) {
												this.setEmailDownloadControlGroupEnabled(value);
												return value;
											}
										}
									},
									enabled: {
										bindTo: "serverAllowEmailDownloading"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "useEmailDownloadLabelContainer",
							selectors: {
								wrapEl: "#useEmailDownloadLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "useEmailDownloadLabel",
									caption: resources.localizableStrings.UseEmailDownloadCaptionEx
								}
							]
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "emailAutoDownloadContainer",
					selectors: {
						wrapEl: "#emailAutoDownloadContainer"
					},
					classes: {
						wrapClassName: ["padding-left40-container", "control-margin-bottom10-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "emailAutoDownloadCheckBoxContainer",
							selectors: {
								wrapEl: "#emailAutoDownloadCheckBoxContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "checkbox-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.CheckBoxEdit",
									id: "emailAutoDownload",
									markerValue: resources.localizableStrings.EmailAutoDownloadCaptionEx,
									enabled: {
										bindTo: "emailDownloadControlGroupEnabled"
									},
									checked: {
										bindTo: "automaticallyAddNewEmails"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "emailAutoDownloadLabelContainer",
							selectors: {
								wrapEl: "#emailAutoDownloadLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "emailAutoDownloadLabel",
									caption: resources.localizableStrings.EmailAutoDownloadCaptionEx
								}
							]
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "minutesContainer",
					selectors: {
						wrapEl: "#minutesContainer"
					},
					classes: {
						wrapClassName: ["padding-left100-container", "control-margin-bottom30-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "minutesTextEditContainer",
							selectors: {
								wrapEl: "#minutesTextEditContainer"
							},
							classes: {
								wrapClassName: ["textedit-minutes-container", "inline-container"]
							},
							items: [
								{
									className: "Terrasoft.IntegerEdit",
									id: "minutesValue",
									markerValue: resources.localizableStrings.MinutesCaptionEx,
									value: {
										bindTo: "emailsCyclicallyAddingInterval"
									},
									enabled: {
										bindTo: "getAutomaticallyAddNewEmailsEnabled"
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
								wrapClassName: ["inline-container", "label-maxwidth150-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "minutesLabel",
									caption: resources.localizableStrings.MinutesCaptionEx
								}
							]
						}
					]
				});

				/**
				 *
				 * @type {Object}
				 */
				var mailSyncStartPeriodMain = this.getContainerConfig("email-import-start-period-container",
					["padding-left40-container", "control-margin-bottom-container"]);
				var mailSyncStartPeriodLabel = this.getContainerConfig("email-import-start-period-label-container",
					["inline-container", "label-maxwidth400-container"]);
				mailSyncStartPeriodLabel.items.push(
					this.getLabelConfig(resources.localizableStrings.StartWithDateCaptionEx));
				mailSyncStartPeriodMain.items.push(mailSyncStartPeriodLabel);
				mailSyncStartPeriodMain.items.push(
					{
						className: "Terrasoft.ComboBoxEdit",
						width: "200px",
						classes: {
							wrapClass: ["bind-account-combo-box-edit"]
						},
						list: {
							bindTo: "mailSyncPeriodList"
						},
						value: {
							bindTo: "mailSyncPeriodValue"
						},
						prepareList: {
							bindTo: "onPrepareMailSyncPeriodList"
						},
						change: {
							bindTo: "onMailSyncPeriodChange"
						},
						enabled: {
							bindTo: "getStartWithDateEnabled"
						}
					});
				items.push(mailSyncStartPeriodMain);
				items.push({
					className: "Terrasoft.Container",
					id: "emailDownloadAllContainer",
					selectors: {
						wrapEl: "#emailDownloadAllContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom10-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "emailDownloadAllRadioButtonContainer",
							selectors: {
								wrapEl: "#emailDownloadAllRadioButtonContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "radio-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.RadioButton",
									markerValue: resources.localizableStrings.EmailDownloadAllCaptionEx,
									tag: "all",
									enabled: {
										bindTo: "emailDownloadControlGroupEnabled"
									},
									checked: {
										bindTo: "downloadFrom"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "emailDownloadAllRadioLabelContainer",
							selectors: {
								wrapEl: "#emailDownloadAllRadioLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "emailDownloadAllLabel",
									caption: resources.localizableStrings.EmailDownloadAllCaptionEx
								}
							]
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "emailDownloadFromGroupContainer",
					selectors: {
						wrapEl: "#emailDownloadFromGroupContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom10-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "emailDownloadFromGroupRadioButtonContainer",
							selectors: {
								wrapEl: "#emailDownloadFromGroupRadioButtonContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "radio-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.RadioButton",
									markerValue: resources.localizableStrings.EmailDownloadFromGroupCaptionEx,
									tag: "fromGroup",
									enabled: {
										bindTo: "emailDownloadControlGroupEnabled"
									},
									checked: {
										bindTo: "downloadFrom"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "emailDownloadFromGroupRadioLabelContainer",
							selectors: {
								wrapEl: "#emailDownloadFromGroupRadioLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "emailDownloadFromGroupLabel",
									caption: resources.localizableStrings.EmailDownloadFromGroupCaptionEx
								}
							]
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "btnChooseGroupContainer",
					selectors: {
						wrapEl: "#btnChooseGroupContainer"
					},
					classes: {
						wrapClassName: ["padding-left40-container"]
					},
					items: [
						{
							className: "Terrasoft.Button",
							id: "btnChooseGroup",
							caption: resources.localizableStrings.ChooseGroupCaptionEx,
							width: "200px",
							style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
							click: {
								bindTo: "onChooseGroupBtnClick"
							},
							enabled: {
								bindTo: "getChooseGroupEnabled"
							}
						}
					]
				});
				return items;
			},

			/**
			 *
			 * @return {Array}
			 */
			getEmailDispatchItems: function() {
				var items = [];
				items.push({
					className: "Terrasoft.Container",
					id: "useForEmailDispatchContainer",
					selectors: {
						wrapEl: "#useForEmailDispatchContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom10-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "useForEmailDispatchCheckBoxContainer",
							selectors: {
								wrapEl: "#useForEmailDispatchCheckBoxContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "checkbox-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.CheckBoxEdit",
									markerValue: resources.localizableStrings.UseForEmailDispatchCaptionEx,
									id: "useForEmailDispatch",
									checked: {
										bindTo: "sendEmailsViaThisAccount",
										bindConfig: {
											converter: function(value) {
												return value;
											}
										}
									},
									enabled: {
										bindTo: "serverAllowEmailSending"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "useForEmailDispatchLabelContainer",
							selectors: {
								wrapEl: "#useForEmailDispatchLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "useForEmailDispatchLabel",
									caption: resources.localizableStrings.UseForEmailDispatchCaptionEx
								}
							]
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "useAsDefaultContainer",
					selectors: {
						wrapEl: "#useAsDefaultContainer"
					},
					classes: {
						wrapClassName: ["padding-left40-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "useAsDefaultCheckBoxContainer",
							selectors: {
								wrapEl: "#useAsDefaultCheckBoxContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "checkbox-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.CheckBoxEdit",
									markerValue: resources.localizableStrings.UseAsDefaultCaptionEx,
									id: "useAsDefault",
									checked: {
										bindTo: "isDefault"
									},
									enabled: {
										bindTo: "setIsDefaultEnabled"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "useAsDefaultLabelContainer",
							selectors: {
								wrapEl: "#useAsDefaultLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "useAsDefaultLabel",
									caption: resources.localizableStrings.UseAsDefaultCaptionEx
								}
							]
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "isAnonymousAuthenticationContainer",
					selectors: {
						wrapEl: "#isAnonymousAuthenticationContainer"
					},
					visible: {bindTo: "isAnonymousAuthenticationVisible"},
					classes: {
						wrapClassName: ["padding-left40-container"]
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "isAnonymousAuthenticationCheckBoxContainer",
							selectors: {
								wrapEl: "#isAnonymousAuthenticationCheckBoxContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "checkbox-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.CheckBoxEdit",
									markerValue: resources.localizableStrings.IsAnonymousAuthenticationCaption,
									id: "isAnonymousAuthentication",
									checked: {
										bindTo: "isAnonymousAuthentication"
									},
									enabled: {
										bindTo: "setIsAnonymousAuthenticationEnabled"
									}
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "isAnonymousAuthenticationLabelContainer",
							selectors: {
								wrapEl: "#isAnonymousAuthenticationLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "isAnonymousAuthenticationLabel",
									caption: resources.localizableStrings.IsAnonymousAuthenticationCaption
								}
							]
						}
					]
				});
				return items;
			},

			/**
			 *
			 * @param {Array} items
			 * @return {Array}
			 */
			getContactImportItems: function(items) {
				items.push(this.getStandardContainerWithCheckBox({
					id: "contact-import-main",
					visible: "contactImportExportVisible",
					checked: "importContacts",
					caption: resources.localizableStrings.ImportContactsCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "contact-import-all",
					tag: "importContactsAll",
					enabled: "importContacts",
					checked: "contactImportFrom",
					caption: resources.localizableStrings.AllCaption
				}));
				var groupContactContainer = this.getStandardContainerWithRadioButton({
					id: "contact-import-from-group",
					tag: "importContactsFromFolders",
					enabled: "importContacts",
					checked: "contactImportFrom",
					caption: resources.localizableStrings.FromFoldersCaption
				});
				groupContactContainer.items[1].classes.wrapClassName.push("width50-container");
				groupContactContainer.items[1].classes.wrapClassName.push("radio-vertical-align");
				var buttonGroupContainer = this.getStandardContainerWithButton({
					id: "contact-import-from-group-button",
					enabled: "getChooseContactGroupEnabled",
					click: "onChooseContactGroupBtnClick",
					caption: resources.localizableStrings.ChooseFolderCaption
				});
				buttonGroupContainer.classes.wrapClassName.push("button-container-margin-left12");
				groupContactContainer.items.push(buttonGroupContainer);
				items.push(groupContactContainer);
				var bindAccountMain = this.getContainerConfig("contact-import-bind-account-container",
					["padding-left40-container", "control-margin-bottom-container"]);
				var bindAccountLabel = this.getContainerConfig("contact-import-bind-account-label-container",
					["inline-container", "label-maxwidth400-container", "width50-container"]);
				bindAccountLabel.items.push(
					this.getLabelConfig(resources.localizableStrings.LinkContactToAccountCaption));
				bindAccountMain.items.push(bindAccountLabel);
				bindAccountMain.items.push(
					{
						className: "Terrasoft.ComboBoxEdit",
						classes: {
							wrapClass: ["bind-account-combo-box-edit"]
						},
						list: {
							bindTo: "bindAccountList"
						},
						value: {
							bindTo: "bindAccountValue"
						},
						prepareList: {
							bindTo: "onPrepareBindAccountList"
						},
						enabled: {
							bindTo: "importContacts"
						}
					});
				items.push(bindAccountMain);
				return items;
			},

			/**
			 *
			 * @param {Array} items
			 * @return {Array}
			 */
			getContactExportItems: function(items) {
				items.push(this.getStandardContainerWithCheckBox({
					id: "contact-export-main",
					visible: "contactImportExportVisible",
					checked: "exportContacts",
					caption: resources.localizableStrings.ExportContactsCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "contact-export-all",
					tag: "exportContactsAll",
					enabled: "exportContacts",
					checked: "contactExportFrom",
					caption: resources.localizableStrings.AllCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "contact-export-choose",
					tag: "exportContactsSelected",
					enabled: "exportContacts",
					checked: "contactExportFrom",
					caption: resources.localizableStrings.ExportContactsSelectedCaption
				}));
				var employeeContainer = this.getStandardContainerWithCheckBox({
					id: "contact-export-employee-group",
					enabled: "contactExportChooseEnabled",
					checked: "exportContactsEmployers",
					caption: resources.localizableStrings.ExportContactsEmployersCaption
				});
				employeeContainer.classes.wrapClassName.push("padding-left80-container");
				items.push(employeeContainer);
				var clientContainer = this.getStandardContainerWithCheckBox({
					id: "contact-export-client-group",
					enabled: "contactExportChooseEnabled",
					checked: "exportContactsCustomers",
					caption: resources.localizableStrings.ExportContactsCustomersCaption
				});
				clientContainer.classes.wrapClassName.push("padding-left80-container");
				items.push(clientContainer);
				var myContactContainer = this.getStandardContainerWithCheckBox({
					id: "contact-export-my-contact-group",
					enabled: "contactExportChooseEnabled",
					checked: "exportContactsOwner",
					caption: resources.localizableStrings.ExportContactsOwnerCaption
				});
				myContactContainer.classes.wrapClassName.push("padding-left80-container");
				items.push(myContactContainer);
				var fromGroupContainer = this.getStandardContainerWithCheckBox({
					id: "contact-export-from-contact-group-group",
					enabled: "contactExportChooseEnabled",
					checked: "exportContactsFromGroups",
					caption: resources.localizableStrings.ExportFromGroupsCaption
				});
				fromGroupContainer.classes.wrapClassName = ["padding-left80-container"];
				fromGroupContainer.items[0].classes.wrapClassName.push("radio-vertical-align");
				fromGroupContainer.items[1].classes.wrapClassName.push("width50-container");
				fromGroupContainer.items[1].classes.wrapClassName.push("radio-vertical-align");
				var buttonFromGroupContainer = this.getStandardContainerWithButton({
					id: "contact-export-from-group-button",
					enabled: "getChooseContactExportFromGroupEnabled",
					click: "onChooseContactExportFromGroupBtnClick",
					caption: resources.localizableStrings.ChooseGroupCaptionEx
				});
				buttonFromGroupContainer.classes.wrapClassName.push("button-container-margin-left12");
				fromGroupContainer.items.push(buttonFromGroupContainer);
				items.push(fromGroupContainer);
				return items;
			},

			/**
			 *
			 * @return {Array}
			 */
			getContactItems: function() {
				var items = [];
				this.getContactImportItems(items);
				this.getContactExportItems(items);
				return items;
			},

			/**
			 *
			 * @param {Array} items
			 * @return {Array}
			 */
			getActivityImportItems: function(items) {
				items.push(this.getStandardContainerWithDateEdit({
					id: "appointment-import-activities-from",
					value: "importActivitiesFrom",
					caption: resources.localizableStrings.ImportAppointmentsFromCaption
				}));
				items.push(this.getStandardContainerWithCheckBox({
					id: "appointment-import-main",
					visible: "activityImportExportVisible",
					checked: "importAppointments",
					caption: resources.localizableStrings.ImportAppointmentsCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "appointment-import-all",
					tag: "importAppointmentsAll",
					enabled: "importAppointments",
					checked: "importAppointmentsFrom",
					caption: resources.localizableStrings.AllCaption
				}));
				var calendarsAppointmentContainer = this.getStandardContainerWithRadioButton({
					id: "appointment-import-from-calendars",
					tag: "importAppointmentsFromCalendars",
					enabled: "importAppointments",
					checked: "importAppointmentsFrom",
					caption: resources.localizableStrings.FromCalendarsCaption
				});
				calendarsAppointmentContainer.items[1].classes.wrapClassName.push("width50-container");
				calendarsAppointmentContainer.items[1].classes.wrapClassName.push("radio-vertical-align");
				var buttonCalendarContainer = this.getStandardContainerWithButton({
					id: "appointment-import-from-calendars-button",
					enabled: "getChooseAppointmentCalendarEnabled",
					click: "onChooseAppointmentCalendarBtnClick",
					caption: resources.localizableStrings.ChooseCalendarsCaption
				});
				buttonCalendarContainer.classes.wrapClassName.push("button-container-margin-left12");
				calendarsAppointmentContainer.items.push(buttonCalendarContainer);
				items.push(calendarsAppointmentContainer);
				items.push(this.getStandardContainerWithCheckBox({
					id: "task-import-main",
					visible: "activityImportExportVisible",
					checked: "importTasks",
					caption: resources.localizableStrings.ImportTasksCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "task-import-all",
					tag: "importTasksAll",
					enabled: "importTasks",
					checked: "importTasksFrom",
					caption: resources.localizableStrings.AllCaption
				}));
				var folderTaskContainer = this.getStandardContainerWithRadioButton({
					id: "task-import-from-folders",
					tag: "importTasksFromFolders",
					enabled: "importTasks",
					checked: "importTasksFrom",
					caption: resources.localizableStrings.FromFoldersCaption
				});
				folderTaskContainer.items[1].classes.wrapClassName.push("width50-container");
				folderTaskContainer.items[1].classes.wrapClassName.push("radio-vertical-align");
				var buttonFolderContainer = this.getStandardContainerWithButton({
					id: "task-import-from-folders-button",
					enabled: "getChooseTaskFolderEnabled",
					click: "onChooseTaskFolderBtnClick",
					caption: resources.localizableStrings.ChooseFolderCaption
				});
				buttonFolderContainer.classes.wrapClassName.push("button-container-margin-left12");
				folderTaskContainer.items.push(buttonFolderContainer);
				items.push(folderTaskContainer);
				return items;
			},

			/**
			 *
			 * @param {Array} items
			 */
			getActivityExportItems: function(items) {
				items.push(this.getStandardContainerWithCheckBox({
					id: "activity-export-main",
					visible: "activityImportExportVisible",
					checked: "exportActivities",
					caption: resources.localizableStrings.ExportActivitiesCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "activity-export-all",
					tag: "exportActivitiesAll",
					enabled: "exportActivities",
					checked: "exportActivityFrom",
					caption: resources.localizableStrings.AllCaption
				}));
				items.push(this.getStandardContainerWithRadioButton({
					id: "activity-export-from-calendars",
					tag: "exportActivitiesSelected",
					enabled: "exportActivities",
					checked: "exportActivityFrom",
					caption: resources.localizableStrings.ExportActivitiesSelectedCaption
				}));
				var appointmentsContainer = this.getStandardContainerWithCheckBox({
					id: "activity-export-appointments-group",
					enabled: "getActivityExportChooseEnabled",
					checked: "exportAppointments",
					caption: resources.localizableStrings.ExportAppointmentsCaption
				});
				appointmentsContainer.classes.wrapClassName.push("padding-left80-container");
				items.push(appointmentsContainer);
				var tasksContainer = this.getStandardContainerWithCheckBox({
					id: "activity-export-tasks-group",
					enabled: "getActivityExportChooseEnabled",
					checked: "exportTasks",
					caption: resources.localizableStrings.ExportTasksCaption
				});
				tasksContainer.classes.wrapClassName.push("padding-left80-container");
				items.push(tasksContainer);
				var sheduleContainer = this.getStandardContainerWithCheckBox({
					id: "activity-export-shedule-group",
					enabled: "getActivityExportChooseEnabled",
					checked: "exportActivitiesFromSheduler",
					caption: resources.localizableStrings.ExportActivitiesFromSchedulerCaption
				});
				sheduleContainer.classes.wrapClassName.push("padding-left80-container");
				items.push(sheduleContainer);
				var fromGroupContainer = this.getStandardContainerWithCheckBox({
					id: "activity-export-from-activity-group-group",
					enabled: "getActivityExportChooseEnabled",
					checked: "exportActivitiesFromGroups",
					caption: resources.localizableStrings.ExportFromGroupsCaption
				});
				fromGroupContainer.classes.wrapClassName = ["padding-left80-container"];
				fromGroupContainer.items[0].classes.wrapClassName.push("radio-vertical-align");
				fromGroupContainer.items[1].classes.wrapClassName.push("width50-container");
				fromGroupContainer.items[1].classes.wrapClassName.push("radio-vertical-align");
				var buttonFromGroupContainer = this.getStandardContainerWithButton({
					id: "contact-export-from-group-button",
					enabled: "getChooseActivitiesExportFromGroupEnabled",
					click: "onChooseActivitiesExportFromGroupBtnClick",
					caption: resources.localizableStrings.ChooseGroupCaptionEx
				});
				buttonFromGroupContainer.classes.wrapClassName.push("button-container-margin-left12");
				fromGroupContainer.items.push(buttonFromGroupContainer);
				items.push(fromGroupContainer);
			},

			/**
			 *
			 * @return {Array}
			 */
			getActivityItems: function() {
				var items = [];
				this.getActivityImportItems(items);
				this.getActivityExportItems(items);
				return items;
			},

			/**
			 *
			 * @return {Array}
			 */
			getButtonsItems: function() {
				var items = [];
				items.push({
					className: "Terrasoft.Container",
					id: "btnOkContainer",
					selectors: {
						wrapEl: "#btnOkContainer"
					},
					classes: {
						wrapClassName: ["inline-container", "btnOk-container"]
					},
					items: [
						{
							className: "Terrasoft.Button",
							id: "btnOk",
							caption: resources.localizableStrings.OkCaptionEx,
							style: Terrasoft.controls.ButtonEnums.style.GREEN,
							click: {
								bindTo: "onOkBtnClick"
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "btnCancelContainer",
					selectors: {
						wrapEl: "#btnCancelContainer"
					},
					classes: {
						wrapClassName: ["inline-container"]
					},
					items: [
						{
							className: "Terrasoft.Button",
							id: "btnCancel",
							caption: resources.localizableStrings.CancelCaptionEx,
							style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
							click: {
								bindTo: "onCancelBtnClick"
							}
						}
					]
				});
				return items;
			},

			/**
			 *
			 * @return {Array}
			 */
			getLeftItems: function() {
				var items = [];
				items.push({
					className: "Terrasoft.Container",
					id: "mailServerLabelContainer",
					selectors: {
						wrapEl: "#mailServerLabelContainer"
					},
					classes: {
						wrapClassName: ["label-above-control-container"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: "mailserverLabel",
							caption: resources.localizableStrings.MailServerCaptionEx,
							classes: {
								labelClass: ["required-caption"]
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "mailServerContainer",
					selectors: {
						wrapEl: "#mailServerContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					items: [
						{
							className: "Terrasoft.ComboBoxEdit",
							id: "mailserver",
							markerValue: resources.localizableStrings.MailServerCaptionEx,
							list: {
								bindTo: "mailServerList"
							},
							value: {
								bindTo: "mailServerValue"
							},
							change: {
								bindTo: "onMailServerChange"
							},
							prepareList: {
								bindTo: "onPrepareMailServerList"
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "senderEmailAddressLabelContainer",
					selectors: {
						wrapEl: "#senderEmailAddressLabelContainer"
					},
					classes: {
						wrapClassName: ["label-above-control-container"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: "senderEmailAddressLabel",
							caption: resources.localizableStrings.SenderEmailAddressCaptionEx,
							classes: {
								labelClass: ["required-caption"]
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "senderEmailAddressContainer",
					selectors: {
						wrapEl: "#senderEmailAddressContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					items: [
						{
							className: "Terrasoft.TextEdit",
							id: "senderemailaddress",
							markerValue: resources.localizableStrings.SenderEmailAddressCaptionEx,
							value: {
								bindTo: "senderEmailAddress"
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "userNameLabelContainer",
					selectors: {
						wrapEl: "#userNameLabelContainer"
					},
					classes: {
						wrapClassName: ["label-above-control-container"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: "usernameLabel",
							caption: resources.localizableStrings.UserNameCaptionEx,
							classes: {
								labelClass: ["required-caption"]
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "userNameContainer",
					selectors: {
						wrapEl: "#userNameContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					items: [
						{
							className: "Terrasoft.TextEdit",
							id: "username",
							markerValue: resources.localizableStrings.UserNameCaptionEx,
							value: {
								bindTo: "userName",
								bindConfig: {
									converter: function(value) {
										this.setMailboxNameValue(value);
										return value;
									}
								}
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "userPasswordLabelContainer",
					selectors: {
						wrapEl: "#userPasswordLabelContainer"
					},
					classes: {
						wrapClassName: ["label-above-control-container"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: "userpasswordLabel",
							caption: resources.localizableStrings.UserPasswordCaptionEx,
							classes: {
								labelClass: ["required-caption"]
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "userPasswordContainer",
					selectors: {
						wrapEl: "#userPasswordContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					items: [
						{
							className: "Terrasoft.TextEdit",
							id: "userPasswordValue",
							markerValue: resources.localizableStrings.UserPasswordCaptionEx,
							protect: true,
							value: {
								bindTo: "userPassword"
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "mailboxNameLabelContainer",
					selectors: {
						wrapEl: "#mailboxNameLabelContainer"
					},
					classes: {
						wrapClassName: ["label-above-control-container"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							id: "mailboxNameLabel",
							caption: resources.localizableStrings.MailboxNameCaptionEx,
							classes: {
								labelClass: ["required-caption"]
							}
						}
					]
				});
				items.push({
					className: "Terrasoft.Container",
					id: "mailboxNameContainer",
					selectors: {
						wrapEl: "#mailboxNameContainer"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					items: [
						{
							className: "Terrasoft.TextEdit",
							id: "mailboxNameValue",
							markerValue: resources.localizableStrings.MailboxNameCaptionEx,
							value: {
								bindTo: "mailboxName"
							}
						}
					]
				});

				items.push({
					className: "Terrasoft.Container",
					id: "useAsSharedMailBox",
					selectors: {
						wrapEl: "#useAsSharedMailBox"
					},
					classes: {
						wrapClassName: ["control-margin-bottom-container"]
					},
					visible: {
						bindTo: "sharedMailBoxVisible"
					},
					items: [
						{
							className: "Terrasoft.Container",
							id: "useAsSharedMailBoxCheckBoxContainer",
							selectors: {
								wrapEl: "#useAsSharedMailBoxCheckBoxContainer"
							},
							classes: {
								wrapClassName: ["smallcontrol-container", "inline-container", "checkbox-vertical-align"]
							},
							items: [
								{
									className: "Terrasoft.CheckBoxEdit",
									markerValue: "SharedCheckBox",
									id: "useAsSharedCheckBox",
									checked: {
										bindTo: "isShared",
										bindConfig: {
											converter: function(value) {
												this.setSharedMailBoxEnabled(value);
												return value;
											}
										}
									},
									enabled: true
								}
							]
						},
						{
							className: "Terrasoft.Container",
							id: "useAsSharedMailBoxLabelContainer",
							selectors: {
								wrapEl: "#useAsSharedMailBoxLabelContainer"
							},
							classes: {
								wrapClassName: ["inline-container", "label-maxwidth400-container"]
							},
							items: [
								{
									className: "Terrasoft.Label",
									id: "useAsSharedLabel",
									caption: resources.localizableStrings.SharedMailBoxLabelCaption
								}
							]
						}
					]
				});

				var exchangeAutoSynchronizationCheckBox = this.getStandardContainerWithCheckBox({
					id: "create-sync-contact-activity-job",
					enabled: "exchangeAutoSynchronizationVisible",
					checked: "exchangeAutoSynchronization",
					caption: resources.localizableStrings.ExchangeAutoSynchronizationLabel
				});
				exchangeAutoSynchronizationCheckBox.visible = {
					bindTo: "exchangeAutoSynchronizationVisible"
				};
				exchangeAutoSynchronizationCheckBox.items[1].classes.wrapClassName.pop();
				exchangeAutoSynchronizationCheckBox.items[1].classes.wrapClassName.push("label-maxwidth250-container");
				items.push(exchangeAutoSynchronizationCheckBox);
				var exchangeAutoSynchronizationInterval = this.getStandardContainerWithIntegerEdit({
					id: "interval-sync-contact-activity-job",
					enabled: "exchangeAutoSynchronization",
					value: "exchangeSyncInterval",
					width: "50px",
					caption: resources.localizableStrings.MinutesCaptionEx
				});
				exchangeAutoSynchronizationInterval.visible = {
					bindTo: "exchangeAutoSynchronizationVisible"
				};
				exchangeAutoSynchronizationInterval.classes.wrapClassName.push("padding-left40-container");
				items.push(exchangeAutoSynchronizationInterval);
				return items;
			},

			/**
			 *
			 * @return {Array}
			 */
			getRightItems: function() {
				var items = [];
				items.push({
					className: "Terrasoft.ControlGroup",
					id: "emailDownloadControlGroupContainer",
					selectors: {
						wrapEl: "#emailDownloadControlGroupContainer"
					},
					classes: {
						wrapClass: "emailDownload-controlgroup",
						wrapContainerClass: "emailDownload-controlgroup-container"
					},
					collapsed: false,
					enabled: {
						bindTo: "emailDownloadControlGroupEnabled"
					},
					caption: resources.localizableStrings.EmailDownloadGroupCaptionEx,
					items: this.getEmailDownloadItems()
				});
				items.push({
					className: "Terrasoft.ControlGroup",
					id: "emailDispatchControlGroupContainer",
					selectors: {
						wrapEl: "#emailDispatchControlGroupContainer"
					},
					classes: {
						wrapClass: "emailDispatch-controlgroup",
						wrapContainerClass: "emailDispatch-controlgroup-container"
					},
					collapsed: false,
					caption: resources.localizableStrings.EmailDispatchGroupCaptionEx,
					items: this.getEmailDispatchItems()
				});
				items.push({
					className: "Terrasoft.ControlGroup",
					id: "contact-import-export-control-group-container",
					selectors: {
						wrapEl: "#contact-import-export-control-group-container"
					},
					classes: {
						wrapClass: "emailDownload-controlgroup",
						wrapContainerClass: "emailDownload-controlgroup-container"
					},
					collapsed: {
						bindTo: "contactImportExportCollapsed"
					},
					visible: {
						bindTo: "contactImportExportVisible"
					},
					caption: resources.localizableStrings.ContactsGroupCaption,
					items: this.getContactItems()
				});
				items.push({
					className: "Terrasoft.ControlGroup",
					id: "activity-import-export-control-group-container",
					selectors: {
						wrapEl: "#activity-import-export-control-group-container"
					},
					classes: {
						wrapClass: "emailDownload-controlgroup",
						wrapContainerClass: "emailDownload-controlgroup-container"
					},
					collapsed: {
						bindTo: "activityImportExportCollapsed"
					},
					visible: {
						bindTo: "activityImportExportVisible"
					},
					caption: resources.localizableStrings.ActivitiesGroupCaption,
					items: this.getActivityItems()
				});
				return items;
			},

			/**
			 *
			 * @return {Terrasoft.Container}
			 */
			getView: function() {
				var view = Ext.create("Terrasoft.Container", {
					id: "main",
					markerValue: resources.localizableStrings.TitleCaptionEx,
					selectors: {
						wrapEl: "#main"
					},
					classes: {
						wrapClassName: ["main-container"]
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
							items: this.getButtonsItems()
						},
						{
							className: "Terrasoft.Container",
							id: "bottomContainer",
							selectors: {
								wrapEl: "#bottomContainer"
							},
							classes: {
								wrapClassName: ["bottom-container"]
							},
							items: [
								{
									className: "Terrasoft.Container",
									id: "leftContainer",
									selectors: {
										wrapEl: "#leftContainer"
									},
									classes: {
										wrapClassName: ["left-container"]
									},
									items: this.getLeftItems()
								},
								{
									className: "Terrasoft.Container",
									id: "rightContainer",
									selectors: {
										wrapEl: "#rightContainer"
									},
									classes: {
										wrapClassName: ["right-container"]
									},
									items: this.getRightItems()
								}
							]
						}
					]
				});
				return view;
			},

			/**
			 * Функция инициализации viewModel.
			 * @return {Terrasoft.BaseViewModel}
			 */
			getViewModel: function() {
				var model = Ext.create("Terrasoft.BaseViewModel", {
					columns: {
						mailServerValue: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "mailServerValue",
							isLookup: true,
							isRequired: true
						},
						mailServerList: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "mailServerList",
							isCollection: true
						},
						userName: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "userName",
							isRequired: true
						},
						userPassword: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "userPassword",
							isRequired: true
						},
						senderEmailAddress: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "senderEmailAddress",
							isRequired: true
						},
						mailboxName: {
							type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
							name: "mailboxName",
							isRequired: true
						}
					},
					validationConfig: {
						senderEmailAddress: [
							function(value) {
								var invalidMessage = "";
								if (!value) {
									return {invalidMessage: invalidMessage};
								}
								if (!EmailHelper.isEmailAddress(value)) {
									invalidMessage = resources.localizableStrings.EmailAddressNotValid;
								}
								return {invalidMessage: invalidMessage};
							}
						]
					},
					values: {
						sharedMailBoxVisible: false,
						isShared: false,
						mailboxSyncSettingsId: null,
						mailboxType: "private",
						downloadFrom: "all",
						emailDownloadControlGroupEnabled: true,
						automaticallyAddNewEmails: false,
						emailsCyclicallyAddingInterval: 1,
						enableMailSynchronization: false,
						mailServerId: null,
						userName: "",
						userPassword: "",
						senderEmailAddress: "",
						mailboxName: "",
						sendEmailsViaThisAccount: false,
						isDefault: false,
						accessControlsVisible: false,
						loadEmailsFromDate: new Date(),
						emailsLastSyncDate: undefined,
						mailSyncPeriodList: new Terrasoft.Collection(),
						mailSyncPeriodCollection: null,
						mailSyncPeriodValue: null,
						mailServerList: new Terrasoft.Collection(),
						mailServerCollection: {},
						serverAllowEmailDownloading: true,
						serverAllowEmailSending: true,
						isAnonymousAuthentication: false,
						isAnonymousAuthenticationVisible: false,
						mailServerTypeId: null,
						exchangeAutoSynchronizationVisible: false,
						exchangeAutoSynchronization: false,
						exchangeSyncInterval: 30,
						contactImportExportCollapsed: true,
						contactImportExportVisible: false,
						importContacts: false,
						contactImportFrom: "importContactsAll",
						contactExportFrom: "exportContactsAll",
						importContactsFolders: null,
						bindAccountList: new Terrasoft.Collection(),
						bindAccountCollection: null,
						bindAccountValue: null,
						exportContacts: false,
						exportContactsEmployers: false,
						exportContactsCustomers: false,
						exportContactsOwner: false,
						exportContactsFromGroups: false,
						exportContactsGroups: null,
						hasContactSettings: false,
						activityImportExportCollapsed: true,
						activityImportExportVisible: false,
						importActivitiesFrom: new Date(),
						importAppointments: false,
						importAppointmentsFrom: "importAppointmentsAll",
						importAppointmentsCalendars: null,
						importTasks: false,
						importTasksFrom: "importTasksAll",
						importTasksFolders: null,
						exportActivities: false,
						exportActivityFrom: "exportActivitiesAll",
						exportAppointments: false,
						exportTasks: false,
						exportActivitiesFromSheduler: false,
						exportActivitiesFromGroups: false,
						exportActivitiesGroups: null,
						hasActivitySettings: false
					},
					methods: {
						onOkBtnClick: function() {
							var invalidMessage = this.validateSettings();
							if (Ext.isEmpty(invalidMessage)) {
								if (this.validate()) {
									this.isServerValid();
								}
							} else {
								Terrasoft.utils.showInformation(invalidMessage);
							}
						},
						onCancelBtnClick: function() {
							sandbox.publish("BackHistoryState");
						},
						validateSettings: function() {
							var invalidMessage = "";
							var isTypeExchange = this.get("mailServerTypeId") ===
								ExchangeNUIConstants.MailServer.Type.Exchange;
							if (!isTypeExchange && !(this.get("enableMailSynchronization") ||
									this.get("sendEmailsViaThisAccount"))) {
								return resources.localizableStrings.NotSetSendingOrReceivingCheckMessageEx;
							} else if (isTypeExchange && !(this.get("enableMailSynchronization") ||
									this.get("sendEmailsViaThisAccount") || this.get("importContacts") ||
									this.get("exportContacts") || this.get("importAppointments") ||
									this.get("importTasks") || this.get("exportActivities"))) {
								return resources.localizableStrings.SyncSettingNotSet;
							} else {
								if (this.get("importContacts") &&
										this.get("contactImportFrom") === "importContactsFromFolders" &&
										!this.validateSelectedItems(this.get("importContactsFolders"))) {
									return resources.localizableStrings.ImportContactsFromFoldersNotSet;
								}
								if (this.get("exportContacts") &&
										this.get("contactExportFrom") === "exportContactsSelected") {
									if (this.get("exportContactsFromGroups") &&
											!this.validateSelectedItems(this.get("exportContactsGroups"))) {
										return resources.localizableStrings.ExportContactsFromGroupsNotSet;
									}
									if (!(this.get("exportContactsEmployers") || this.get("exportContactsCustomers") ||
											this.get("exportContactsOwner") || this.get("exportContactsFromGroups"))) {
										return resources.localizableStrings.ExportContactsSelectedNotSet;
									}
								}
								if (this.get("importAppointments") &&
										this.get("importAppointmentsFrom") === "importAppointmentsFromCalendars" &&
										!this.validateSelectedItems(this.get("importAppointmentsCalendars"))) {
									return resources.localizableStrings.ImportAppointmentsFromCalendarsNotSet;
								}
								if (this.get("importTasks") &&
										this.get("importTasksFrom") === "importTasksFromFolders" &&
										!this.validateSelectedItems(this.get("importTasksFolders"))) {
									return resources.localizableStrings.ImportTasksFromFoldersNotSet;
								}
								if (this.get("exportActivities") &&
										this.get("exportActivityFrom") === "exportActivitiesSelected") {
									if (this.get("exportActivitiesFromGroups") &&
											!this.validateSelectedItems(this.get("exportActivitiesGroups"))) {
										return resources.localizableStrings.ExportActivitiesFromGroupsNotSet;
									}
									if (!(this.get("exportAppointments") || this.get("exportTasks") ||
											this.get("exportActivitiesFromSheduler") ||
											this.get("exportActivitiesFromGroups"))) {
										return resources.localizableStrings.ExportActivitiesSelectedNotSet;
									}
								}
							}
							if (isTypeExchange && this.get("exchangeAutoSynchronization") &&
									!this.validateIntervalTime(this.get("exchangeSyncInterval"))) {
								return resources.localizableStrings.IntervalTooSmallMessage;
							}
							if (this.get("enableMailSynchronization") && this.get("automaticallyAddNewEmails") &&
									!this.validateIntervalTime(this.get("emailsCyclicallyAddingInterval"))) {
								return resources.localizableStrings.EmailsCyclicallyAddingIntervalTooSmallCaptionEx;
							}
							return invalidMessage;
						},
						validateSelectedItems: function(itemsArray) {
							return !Ext.isEmpty(itemsArray) && !Ext.isEmpty(Ext.decode(itemsArray));
						},
						validateIntervalTime: function(interval) {
							var intervalTime = parseInt(interval, 10);
							return (intervalTime > 0) && !isNaN(intervalTime);
						},
						onChooseGroupBtnClick: function() {
							this.set("currentFolderClassName", ExchangeNUIConstants.ExchangeFolder.NoteClass.Name);
							this.checkUserCredentials();
						},
						onAccessBtnClick: function() {
						},
						onPrepareMailServerList: function(filter, list) {
							list.clear();
							var collection = this.get("mailServerCollection");
							list.loadAll(collection);
						},
						onMailServerChange: function(item) {
							if (item) {
								var id = item.value;
								var select = Ext.create("Terrasoft.EntitySchemaQuery", {
									rootSchemaName: "MailServer"
								});
								select.addColumn("AllowEmailDownloading");
								select.addColumn("AllowEmailSending");
								select.addColumn("Type.Id", "TypeId");
								select.getEntity(id, this.mailServerChangeCallback, this);
							}
						},
						mailServerChangeCallback: function(result) {
							if (result.success) {
								var entity = result.entity;
								if (entity) {
									this.set("serverAllowEmailDownloading", entity.get("AllowEmailDownloading"));
									this.set("serverAllowEmailSending", entity.get("AllowEmailSending"));
									var mailServerTypeId = entity.get("TypeId");
									this.set("mailServerTypeId", mailServerTypeId);
									this.showExchangeDetail(
											mailServerTypeId === ExchangeNUIConstants.MailServer.Type.Exchange
									);
									if (!entity.get("AllowEmailSending")) {
										this.set("sendEmailsViaThisAccount", entity.get("AllowEmailSending"));
										this.set("isDefault", entity.get("AllowEmailSending"));
									}
								}
							}
						},
						showExchangeDetail: function(showDetail) {
							if (!Ext.isBoolean(showDetail)) {
								showDetail = false;
							}
							this.set("contactImportExportVisible", showDetail);
							this.set("activityImportExportVisible", showDetail);
							this.set("exchangeAutoSynchronizationVisible", showDetail);
							this.set("isAnonymousAuthenticationVisible", !showDetail);
						},
						getSettingsCallback: function(result) {
							this.set("accessControlsVisible", result);
						},
						setEmailDownloadControlGroupEnabled: function(value) {
							this.set("emailDownloadControlGroupEnabled", value);
						},
						setSharedMailBoxEnabled: function(value) {
							this.set("mailboxType", value ? "public" : "private");
						},
						setSharedMailBoxVisible: function() {
							RightUtilities.checkCanExecuteOperation({operation: "CanUseSharedMailBox"}, function(result) {
								this.set("sharedMailBoxVisible", result);
							}, this);
						},
						setIsDefaultEnabled: function() {
							return this.get("sendEmailsViaThisAccount") && (this.get("mailboxType") === "private");
						},
						setIsAnonymousAuthenticationEnabled: function() {
							return this.get("sendEmailsViaThisAccount");
						},
						getAutomaticallyAddNewEmailsEnabled: function() {
							return (this.get("automaticallyAddNewEmails") &&
								this.get("emailDownloadControlGroupEnabled"));
						},
						getStartWithDateEnabled: function() {
							return this.get("emailDownloadControlGroupEnabled");
						},
						getChooseGroupEnabled: function() {
							return (this.get("downloadFrom") === "fromGroup" &&
							this.get("emailDownloadControlGroupEnabled"));
						},
						setMailboxNameValue: function(value) {
							var mailboxName = this.get("mailboxName");
							if (Ext.isEmpty(mailboxName)) {
								this.set("mailboxName", value);
							}
						},
						checkIsProviderSMTPAddressSet: function(callback) {
							callback.call(this);
						},
						createBPMonlineEmailFolder: function() {
							var data = {
								id: this.get("mailServerValue").value,
								userName: this.get("userName"),
								userPassword: this.get("userPassword")
							};
							this.requestService(data, "CreateBPMOnlineFolder", function(request, success) {
								if (success) {
									sandbox.publish("PushHistoryState", {hash: "MailboxSynchronizationSettingsModule"});
								} else {
									Terrasoft.utils.showInformation(resources.localizableStrings.ImapExceptionMessageEx,
										null, null, {buttons: ["ok"]});
								}
							});
						},
						checkEditContactRights: function(callback, scope) {
							RightUtilities.checkCanEdit({
								schemaName: "Contact",
								primaryColumnValue: Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
								isNew: false
							}, function(result) {
								callback.call(scope, result);
							}, this);
						},
						checkContactEmail: function(callback, innerCallback) {
							var that = this;
							var userEmailAddress = this.get("senderEmailAddress");
							if (userEmailAddress.indexOf("@") === -1) {
								callback.call(this, innerCallback);
							} else {
								this.checkEditContactRights(function(result) {
									if (!Ext.isEmpty(result)) {
										callback.call(this, innerCallback);
										return;
									}
									var select = Ext.create("Terrasoft.EntitySchemaQuery", {
										rootSchemaName: "ContactCommunication"
									});
									select.addColumn("Id");
									select.filters.addItem(Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "CommunicationType",
										ConfigurationConstants.CommunicationType.Email));
									select.filters.addItem(Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "Number", userEmailAddress));
									select.filters.addItem(Terrasoft.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "Contact",
										Terrasoft.SysValue.CURRENT_USER_CONTACT.value));
									select.getEntityCollection(function(response) {
										var collection = response.collection;
										if (collection.getCount() === 0) {
											this.AddEmailToContactCommunications(callback, innerCallback);
										} else {
											callback.call(this, innerCallback);
										}
									}, this);
								}, that);
							}
						},
						AddEmailToContactCommunications: function(callback, innerCallback) {
							Terrasoft.utils.showConfirmation(resources.localizableStrings.AddContactEmailMessageEx,
								function(returnCode) {
									if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
										var insert = Ext.create("Terrasoft.InsertQuery", {
											rootSchemaName: "ContactCommunication"
										});
										var id = Terrasoft.utils.generateGUID();
										insert.setParameterValue("Id", id, Terrasoft.DataValueType.GUID);
										insert.setParameterValue("CommunicationType",
											ConfigurationConstants.CommunicationType.Email,
											Terrasoft.DataValueType.GUID);
										insert.setParameterValue("Contact",
											Terrasoft.SysValue.CURRENT_USER_CONTACT.value,
											Terrasoft.DataValueType.GUID);
										insert.setParameterValue("Number", this.get("senderEmailAddress"),
											Terrasoft.DataValueType.TEXT);
										insert.execute();
										callback.call(this, innerCallback);
									} else {
										callback.call(this, innerCallback);
									}
								}, ["yes", "no"], this);
						},
						isServerValid: function() {
							var data = {
								id: this.get("mailServerValue").value,
								userName: this.get("userName"),
								userPassword: this.get("userPassword"),
								enableSync: this.get("enableMailSynchronization"),
								sendEmail: this.get("sendEmailsViaThisAccount"),
								senderEmailAddress: this.get("senderEmailAddress"),
								isAnonymousAuthentication: this.get("isAnonymousAuthentication")
							};
							MaskHelper.ShowBodyMask();
							this.requestService(data, "IsServerValid", function(request, success, response) {
								MaskHelper.HideBodyMask();
								if (success) {
									var result = Ext.decode(response.responseText);
									if (result.IsServerValidResult.IsValid) {
										this.checkUniqueness(this);
									} else {
										Terrasoft.utils.showInformation(result.IsServerValidResult.Message, null, null,
											{buttons: ["ok"]});
									}
								}
							}.bind(this), 180000);
						},
						createOrDeleteSyncJob: function() {
							function createExchangeJob() {
								return this.get("exchangeAutoSynchronizationVisible") &&
									this.get("exchangeAutoSynchronization");
							}

							var interval = parseInt(this.get("emailsCyclicallyAddingInterval"), 10);
							var data = {
								create: this.get("enableMailSynchronization") && this.get("automaticallyAddNewEmails"),
								interval: interval,
								serverId: this.get("mailServerValue").value,
								senderEmailAddress: this.get("senderEmailAddress"),
								createContactJob: createExchangeJob.call(this) &&
									(this.get("importContacts") || this.get("exportContacts")),
								createActivityJob: createExchangeJob.call(this) && (this.get("importAppointments") ||
									this.get("importTasks") || this.get("exportActivities")),
								contactActivityInterval: this.get("exchangeSyncInterval")
							};
							this.requestService(data, "CreateDeleteSyncJob", function(request, success, response) {
								if (success) {
									var result = Ext.decode(response.responseText);
									if (!Ext.isEmpty(result.CreateDeleteSyncJobResult)) {
										Terrasoft.utils.showInformation(result.CreateDeleteSyncJobResult, null, null,
											{buttons: ["ok"]});
									} else {
										this.checkContactEmail(this.checkIsProviderSMTPAddressSet,
											this.saveSettings);
									}
								}
							}.bind(this));
						},
						getSettings: function(callback, scope) {
							function addContactSettingsColumn(query) {
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].Id",
									"ContactSyncSettingsId");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ImportContacts",
									"ImportContacts");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ImportContactsAll",
									"ImportContactsAll");
								query.addColumn(
									"[ContactSyncSettings:MailboxSyncSettings:Id].ImportContactsFromFolders",
									"ImportContactsFromFolders");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].LinkContactToAccount",
									"LinkContactToAccount");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsSelected",
									"ExportContactsSelected");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsEmployers",
									"ExportContactsEmployers");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsCustomers",
									"ExportContactsCustomers");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsOwner",
									"ExportContactsOwner");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsFromGroups",
									"ExportContactsFromGroups");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContacts",
									"ExportContacts");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsAll",
									"ExportContactsAll");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ImportContactsFolders",
									"ImportContactsFolders");
								query.addColumn("[ContactSyncSettings:MailboxSyncSettings:Id].ExportContactsGroups",
									"ExportContactsGroups");
							}

							function addActivitySettingsColumn(query) {
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].Id",
									"ActivitySyncSettingsId");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportActivitiesFrom",
									"ImportActivitiesFrom");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportTasks",
									"ImportTasks");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportTasksAll",
									"ImportTasksAll");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportTasksFromFolders",
									"ImportTasksFromFolders");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportTasksFolders",
									"ImportTasksFolders");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ImportAppointments",
									"ImportAppointments");
								query.addColumn(
									"[ActivitySyncSettings:MailboxSyncSettings:Id].ImpAppointmentsFromCalendars",
									"ImpAppointmentsFromCalendars");
								query.addColumn(
									"[ActivitySyncSettings:MailboxSyncSettings:Id].ImportAppointmentsCalendars",
									"ImportAppointmentsCalendars");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ExportActivities",
									"ExportActivities");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ExportAppointments",
									"ExportAppointments");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ExportTasks",
									"ExportTasks");
								query.addColumn(
									"[ActivitySyncSettings:MailboxSyncSettings:Id].ExportActivitiesFromScheduler",
									"ExportActivitiesFromScheduler");
								query.addColumn(
									"[ActivitySyncSettings:MailboxSyncSettings:Id].ExportActivitiesFromGroups",
									"ExportActivitiesFromGroups");
								query.addColumn("[ActivitySyncSettings:MailboxSyncSettings:Id].ExportActivitiesGroups",
									"ExportActivitiesGroups");
								query.addColumn(
									"[ActivitySyncSettings:MailboxSyncSettings:Id].ExportActivitiesSelected",
									"ExportActivitiesSelected");
							}

							function getContactImportFrom(entity) {
								var result;
								if (entity.get("ImportContactsAll")) {
									result = "importContactsAll";
								} else if (entity.get("ImportContactsFromFolders")) {
									result = "importContactsFromFolders";
								}
								return result;
							}

							var id = this.get("mailboxSyncSettingsId");
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "MailboxSyncSettings"
							});
							select.addColumn("AutomaticallyAddNewEmails");
							select.addColumn("EnableMailSynhronization");
							select.addColumn("EmailsCyclicallyAddingInterval");
							select.addColumn("LoadAllEmailsFromMailBox");
							select.addColumn("MailServer");
							select.addColumn("MailServer.Type.Id", "mailServerTypeId");
							select.addColumn("UserName");
							select.addColumn("UserPassword");
							select.addColumn("SenderEmailAddress");
							select.addColumn("MailboxName");
							select.addColumn("IsShared");
							select.addColumn("SendEmailsViaThisAccount");
							select.addColumn("IsDefault");
							select.addColumn("LoadEmailsFromDate");
							select.addColumn("IsAnonymousAuthentication");
							select.addColumn("MailSyncPeriod");
							select.addColumn("ExchangeAutoSynchronization");
							select.addColumn("ExchangeSyncInterval");
							addContactSettingsColumn(select);
							addActivitySettingsColumn(select);
							select.getEntity(id, function(result) {
								if (result.success) {
									var entity = result.entity;
									this.set("automaticallyAddNewEmails", entity.get("AutomaticallyAddNewEmails"));
									this.set("enableMailSynchronization", entity.get("EnableMailSynhronization"));
									this.set("emailsCyclicallyAddingInterval",
										entity.get("EmailsCyclicallyAddingInterval"));
									this.set("loadAllEmailsFromMailBox", entity.get("LoadAllEmailsFromMailBox"));
									this.set("mailServerValue", {
										value: entity.get("MailServer").value,
										displayValue: entity.get("MailServer").displayValue
									});
									var mailServerTypeId = entity.get("mailServerTypeId");
									this.set("mailServerTypeId", mailServerTypeId);
									var isTypeExchange =
										(mailServerTypeId === ExchangeNUIConstants.MailServer.Type.Exchange);
									this.set("contactImportExportVisible", isTypeExchange);
									this.set("activityImportExportVisible", isTypeExchange);
									this.set("userName", entity.get("UserName"));
									this.set("userPassword", entity.get("UserPassword"));
									this.set("senderEmailAddress", entity.get("SenderEmailAddress"));
									this.set("mailboxName", entity.get("MailboxName"));
									var isShared = entity.get("IsShared");
									this.set("mailboxType", isShared ? "public" : "private");
									this.set("isShared", isShared);
									this.set("sendEmailsViaThisAccount", entity.get("SendEmailsViaThisAccount"));
									this.set("isDefault", entity.get("IsDefault"));
									var loadAllEmailsFromMailBox = entity.get("LoadAllEmailsFromMailBox");
									this.set("downloadFrom", loadAllEmailsFromMailBox ? "all" : "fromGroup");
									this.set("loadEmailsFromDate", entity.get("LoadEmailsFromDate"));
									this.set("isAnonymousAuthentication", entity.get("IsAnonymousAuthentication"));
									this.set("mailSyncPeriodValue", {
										value: entity.get("MailSyncPeriod").value,
										displayValue: entity.get("MailSyncPeriod").displayValue
									});
									this.set("exchangeAutoSynchronization", entity.get("ExchangeAutoSynchronization"));
									this.set("exchangeSyncInterval", entity.get("ExchangeSyncInterval"));
									var contactSyncSettingsId = entity.get("ContactSyncSettingsId");
									if (contactSyncSettingsId) {
										this.set("hasContactSettings", true);
										this.set("importContacts", entity.get("ImportContacts"));
										this.set("contactImportFrom", getContactImportFrom(entity));
										this.set("bindAccountValue", {
											value: entity.get("LinkContactToAccount").value,
											displayValue: entity.get("LinkContactToAccount").displayValue
										});
										this.set("exportContacts", entity.get("ExportContacts"));
										this.set("contactExportFrom", entity.get("ExportContactsAll")
											? "exportContactsAll"
											: "exportContactsSelected");
										this.set("exportContactsEmployers", entity.get("ExportContactsEmployers"));
										this.set("exportContactsCustomers", entity.get("ExportContactsCustomers"));
										this.set("exportContactsOwner", entity.get("ExportContactsOwner"));
										this.set("exportContactsFromGroups", entity.get("ExportContactsFromGroups"));
										this.set("importContactsFolders", entity.get("ImportContactsFolders"));
										this.set("exportContactsGroups", entity.get("ExportContactsGroups"));
									}
									var activitySyncSettingsId = entity.get("ActivitySyncSettingsId");
									if (activitySyncSettingsId) {
										this.set("hasActivitySettings", true);
										this.set("importActivitiesFrom", entity.get("ImportActivitiesFrom"));
										this.set("importAppointments", entity.get("ImportAppointments"));
										if (entity.get("ImpAppointmentsFromCalendars")) {
											this.set("importAppointmentsFrom", "importAppointmentsFromCalendars");
										}
										this.set("importAppointmentsCalendars",
											entity.get("ImportAppointmentsCalendars"));
										this.set("importTasks", entity.get("ImportTasks"));
										if (entity.get("ImportTasksFromFolders")) {
											this.set("importTasksFrom", "importTasksFromFolders");
										}
										this.set("importTasksFolders", entity.get("ImportTasksFolders"));
										this.set("exportActivities", entity.get("ExportActivities"));
										this.set("exportAppointments", entity.get("ExportAppointments"));
										this.set("exportTasks", entity.get("ExportTasks"));
										this.set("exportActivitiesFromSheduler",
											entity.get("ExportActivitiesFromScheduler"));
										this.set("exportActivitiesFromGroups",
											entity.get("ExportActivitiesFromGroups"));
										this.set("exportActivitiesGroups", entity.get("ExportActivitiesGroups"));
										if (entity.get("ExportActivitiesSelected")) {
											this.set("exportActivityFrom", "exportActivitiesSelected");
										}
									}
								}
								callback.call(scope);
							}, this);
							RightUtilities.checkCanExecuteOperation({
								operation: "CanManageMailServers"
							}, this.getSettingsCallback, this);
						},
						saveSettings: function() {
							var scope = this;
							var settingsId = this.get("mailboxSyncSettingsId");
							if (settingsId) {
								var update = Ext.create("Terrasoft.UpdateQuery", {
									rootSchemaName: "MailboxSyncSettings"
								});
								var filters = update.filters;
								var idFilter = update.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
									"Id", settingsId);
								filters.add("IdFilter", idFilter);
								update.setParameterValue("AutomaticallyAddNewEmails",
									this.get("automaticallyAddNewEmails"), Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("EnableMailSynhronization",
									this.get("enableMailSynchronization"), Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("EmailsCyclicallyAddingInterval",
									this.get("emailsCyclicallyAddingInterval"), Terrasoft.DataValueType.INTEGER);
								update.setParameterValue("SysAdminUnit",
									Terrasoft.SysValue.CURRENT_USER.value, Terrasoft.DataValueType.GUID);
								update.setParameterValue("LoadAllEmailsFromMailBox",
										this.get("downloadFrom") === "all", Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("MailServer",
									this.get("mailServerValue").value, Terrasoft.DataValueType.GUID);
								update.setParameterValue("UserName",
									this.get("userName"), Terrasoft.DataValueType.TEXT);
								update.setParameterValue("UserPassword",
									this.get("userPassword"), Terrasoft.DataValueType.TEXT);
								update.setParameterValue("SenderEmailAddress",
									this.get("senderEmailAddress"), Terrasoft.DataValueType.TEXT);
								update.setParameterValue("MailboxName",
									this.get("mailboxName"), Terrasoft.DataValueType.TEXT);
								update.setParameterValue("IsShared",
										this.get("mailboxType") === "public", Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("SendEmailsViaThisAccount",
									this.get("sendEmailsViaThisAccount"), Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("IsDefault",
									this.get("isDefault"), Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("LoadEmailsFromDate",
									this.get("loadEmailsFromDate"), Terrasoft.DataValueType.DATE);
								update.setParameterValue("IsAnonymousAuthentication",
									this.get("isAnonymousAuthentication"), Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("MailSyncPeriod",
									this.get("mailSyncPeriodValue").value, Terrasoft.DataValueType.GUID);
								update.setParameterValue("ExchangeAutoSynchronization",
									this.get("exchangeAutoSynchronization"), Terrasoft.DataValueType.BOOLEAN);
								update.setParameterValue("ExchangeSyncInterval",
									this.get("exchangeSyncInterval"), Terrasoft.DataValueType.INTEGER);
								if (this.get("emailsLastSyncDate") !== undefined) {
									update.setParameterValue("LastSyncDate",
										this.get("emailsLastSyncDate"), Terrasoft.DataValueType.DATE);
								}
								update.execute(function() {
									if (scope.get("mailServerTypeId") === ExchangeNUIConstants.MailServer.Type.Exchange) {
										if (scope.get("hasContactSettings")) {
											scope.processContactSyncSettings("update", scope.saveFoldersSettings);
										} else {
											scope.processContactSyncSettings("insert", scope.saveFoldersSettings);
										}
										if (scope.get("hasActivitySettings")) {
											scope.processActivitySyncSettings("update");
										} else {
											scope.processActivitySyncSettings("insert");
										}
									} else {
										scope.processContactSyncSettings("delete", scope.saveFoldersSettings);
										scope.processActivitySyncSettings("delete");
									}
								});
							} else {
								var insert = this.getInsertMailboxSyncSettings(scope);
								insert.execute(function() {
									if (scope.get("mailServerTypeId") === ExchangeNUIConstants.MailServer.Type.Exchange) {
										scope.processContactSyncSettings("insert", scope.saveFoldersSettings);
										scope.processActivitySyncSettings("insert");
									} else {
										scope.saveFoldersSettings.call(scope);
									}
								});
							}
						},
						processContactSyncSettings: function(action, callback) {
							var query;
							var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"MailboxSyncSettings",
								this.get("mailboxSyncSettingsId"));
							switch (action) {
								case "insert":
									query = Ext.create("Terrasoft.InsertQuery", {
										rootSchemaName: "ContactSyncSettings"
									});
									this.fillContactSyncSettingsQuery.call(this, query);
									break;
								case "update":
									query = Ext.create("Terrasoft.UpdateQuery", {
										rootSchemaName: "ContactSyncSettings"
									});
									this.fillContactSyncSettingsQuery.call(this, query);
									query.filters.add("IdFilter", idFilter);
									break;
								case "delete":
									query = Ext.create("Terrasoft.DeleteQuery", {
										rootSchemaName: "ContactSyncSettings"
									});
									query.filters.add("IdFilter", idFilter);
									break;
								default:
									break;
							}
							query.execute(function() {
								if (callback) {
									callback.call(this);
								}
							}, this);
						},
						processActivitySyncSettings: function(action) {
							var query;
							var idFilter = Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"MailboxSyncSettings",
								this.get("mailboxSyncSettingsId"));
							switch (action) {
								case "insert":
									query = Ext.create("Terrasoft.InsertQuery", {
										rootSchemaName: "ActivitySyncSettings"
									});
									this.fillActivitySyncSettingsQuery.call(this, query);
									break;
								case "update":
									query = Ext.create("Terrasoft.UpdateQuery", {
										rootSchemaName: "ActivitySyncSettings"
									});
									this.fillActivitySyncSettingsQuery.call(this, query);
									query.filters.add("IdFilter", idFilter);
									break;
								case "delete":
									query = Ext.create("Terrasoft.DeleteQuery", {
										rootSchemaName: "ActivitySyncSettings"
									});
									query.filters.add("IdFilter", idFilter);
									break;
								default:
									break;
							}
							query.execute();
						},
						checkUniqueness: function(scope) {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "MailboxSyncSettings"
							});
							select.addColumn("Id");
							var filters = Ext.create("Terrasoft.FilterGroup");
							var uniqureFiledsFilters = Ext.create("Terrasoft.FilterGroup");
							uniqureFiledsFilters.logicalOperation = Terrasoft.LogicalOperatorType.OR;
							uniqureFiledsFilters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"SenderEmailAddress", scope.get("senderEmailAddress")));
							uniqureFiledsFilters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"MailboxName", scope.get("mailboxName")));
							filters.addItem(uniqureFiledsFilters);
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
								"Id", scope.get("mailboxSyncSettingsId")));
							select.filters = filters;
							select.getEntityCollection(function(response) {
								if (response.success) {
									var collection = response.collection.collection;
									if (collection.length === 0) {
										this.createOrDeleteSyncJob();
									} else {
										Terrasoft.utils.showInformation(resources.localizableStrings.settingsExistsEx);
									}
								}
							}, scope);
						},
						onMailSyncPeriodChange: function(item) {
							function getNewDate(code, value) {
								var newDate;
								var currentDate = Ext.Date.clearTime(new Date());
								switch (code) {
									case "Day":
										newDate = Ext.Date.add(currentDate, Ext.Date.DAY, -value);
										break;
									case "Week":
										newDate = Ext.Date.add(currentDate, Ext.Date.DAY, -value * 7);
										break;
									case "Month":
										newDate = Ext.Date.add(currentDate, Ext.Date.MONTH, -value);
										break;
									case "Year":
										newDate = Ext.Date.add(currentDate, Ext.Date.YEAR, -value);
										break;
									case "All":
										break;
									default:
										break;
								}
								return newDate;
							}

							if (item) {
								var id = item.value;
								var collection = this.get("mailSyncPeriodCollection");
								var tempCollection = collection.filter(function(entity) {
									return entity.get("value") === id;
								});
								if (tempCollection.getCount() > 0) {
									var curItem = tempCollection.getByIndex(0);
									var newDate = getNewDate(curItem.get("Code"), curItem.get("Number"));
									this.set("loadEmailsFromDate", newDate);
									this.set("emailsLastSyncDate", null);
								}
							}
						},
						onPrepareMailSyncPeriodList: function(filter, list) {
							function getDefValue(collection) {
								var tempCollection = collection.filter(function(item) {
									return item.get("Code") === "Week" && item.get("Number") === 1;
								});
								var result;
								var entity;
								if (tempCollection.getCount() > 0) {
									entity = tempCollection.getByIndex(0);
									result = {
										displayValue: entity.get("displayValue"),
										value: entity.get("value")
									};
								} else {
									entity = collection.getByIndex(0);
									result = {
										displayValue: entity.get("displayValue"),
										value: entity.get("value")
									};
								}
								return result;
							}

							function fillList(list, collection) {
								var obj = {};
								if (collection && collection.getCount() > 0) {
									Terrasoft.each(collection.getItems(), function(item) {
										obj[item.get("value")] = {
											displayValue: item.get("displayValue"),
											value: item.get("value")
										};
									});
									list.loadAll(obj);
								}
							}

							list.clear();
							var collection = this.get("mailSyncPeriodCollection");
							if (collection === null) {
								this.initializeMailSyncPeriodCollection.call(this, function() {
									fillList(list, this.get("mailSyncPeriodCollection"));
									if (!this.get("mailSyncPeriodValue")) {
										this.set("mailSyncPeriodValue",
											getDefValue(this.get("mailSyncPeriodCollection")));
									}
								});
							} else {
								fillList(list, collection);
							}
						},
						onPrepareBindAccountList: function(filter, list) {
							function getDefValue(collection) {
								var entity = collection.getByIndex(0);
								return {
									displayValue: entity.get("displayValue"),
									value: entity.get("value")
								};
							}

							function fillList(list, collection) {
								var obj = {};
								if (collection && collection.getCount() > 0) {
									Terrasoft.each(collection.getItems(), function(item) {
										obj[item.get("value")] = {
											displayValue: item.get("displayValue"),
											value: item.get("value")
										};
									});
									list.loadAll(obj);
								}
							}

							list.clear();
							var collection = this.get("bindAccountCollection");
							if (collection === null) {
								this.initializeBindAccountCollection.call(this, function() {
									fillList(list, this.get("bindAccountCollection"));
									if (!this.get("bindAccountValue")) {
										this.set("bindAccountValue", getDefValue(this.get("bindAccountCollection")));
									}
								});
							} else {
								fillList(list, collection);
							}
						},
						getChooseContactGroupEnabled: function() {
							return this.get("contactImportFrom") === "importContactsFromFolders" &&
								this.get("importContacts");
						},
						onChooseContactGroupBtnClick: function() {
							this.set("currentFolderClassName", ExchangeNUIConstants.ExchangeFolder.ContactClass.Name);
							this.checkUserCredentials();
						},
						contactExportChooseEnabled: function() {
							return this.get("contactExportFrom") === "exportContactsSelected" &&
								this.get("exportContacts");
						},
						getChooseContactExportFromGroupEnabled: function() {
							return this.get("contactExportFrom") === "exportContactsSelected" &&
								this.get("exportContacts") && this.get("exportContactsFromGroups");
						},
						onChooseContactExportFromGroupBtnClick: function() {
							this.set("currentFolderClassName", ExchangeNUIConstants.ExchangeFolder.BPMContact.Name);
							this.checkUserCredentials();
						},
						getChooseAppointmentCalendarEnabled: function() {
							return this.get("importAppointmentsFrom") === "importAppointmentsFromCalendars" &&
								this.get("importAppointments");
						},
						getChooseTaskFolderEnabled: function() {
							return this.get("importTasksFrom") === "importTasksFromFolders" &&
								this.get("importTasks");
						},
						getActivityExportChooseEnabled: function() {
							return this.get("exportActivityFrom") === "exportActivitiesSelected" &&
								this.get("exportActivities");
						},
						getChooseActivitiesExportFromGroupEnabled: function() {
							return this.get("exportActivityFrom") === "exportActivitiesSelected" &&
								this.get("exportActivities") && this.get("exportActivitiesFromGroups");
						},
						onChooseAppointmentCalendarBtnClick: function() {
							this.set("currentFolderClassName",
								ExchangeNUIConstants.ExchangeFolder.AppointmentClass.Name);
							this.checkUserCredentials();
						},
						onChooseTaskFolderBtnClick: function() {
							this.set("currentFolderClassName", ExchangeNUIConstants.ExchangeFolder.TaskClass.Name);
							this.checkUserCredentials();
						},
						onChooseActivitiesExportFromGroupBtnClick: function() {
							this.set("currentFolderClassName", ExchangeNUIConstants.ExchangeFolder.BPMActivity.Name);
							this.checkUserCredentials();
						},

						/**
						 *
						 * @param {Function} callback
						 */
						initializeMailSyncPeriodCollection: function(callback) {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "MailSyncPeriod"
							});
							select.addColumn("Id", "value");
							select.addColumn("Name", "displayValue");
							select.addColumn("Code");
							select.addColumn("Number");
							var positionColumn = select.addColumn("Position");
							positionColumn.orderDirection = Terrasoft.core.enums.OrderDirection.ASC;
							positionColumn.orderPosition = 1;
							select.getEntityCollection(function(response) {
								if (response.success) {
									this.set("mailSyncPeriodCollection", response.collection);
									callback.call(this);
								}
							}, this);
						},

						/**
						 *
						 * @param {Function} callback
						 */
						initializeBindAccountCollection: function(callback) {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "LinkContactToAccount"
							});
							select.addColumn("Id", "value");
							select.addColumn("Name", "displayValue");
							select.addColumn("Code");
							select.getEntityCollection(function(response) {
								if (response.success) {
									this.set("bindAccountCollection", response.collection);
									callback.call(this);
								}
							}, this);
						},

						/**
						 *
						 * @param {Terrasoft.InsertQuery|Terrasoft.UpdateQuery} query
						 */
						fillActivitySyncSettingsQuery: function(query) {
							query.setParameterValue("ImportAppointments", this.get("importAppointments"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportActivitiesFrom",
								this.get("importActivitiesFrom"), Terrasoft.DataValueType.DATE);
							query.setParameterValue("AppointmentLastSyncDate", null, Terrasoft.DataValueType.DATE);
							query.setParameterValue("TaskLastSyncDate", null, Terrasoft.DataValueType.DATE);
							query.setParameterValue("ImportAppointmentsAll",
									this.get("importAppointmentsFrom") === "importAppointmentsAll",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImpAppointmentsFromCalendars",
									this.get("importAppointmentsFrom") === "importAppointmentsFromCalendars",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportAppointmentsCalendars",
								this.get("importAppointmentsCalendars"), Terrasoft.DataValueType.TEXT);
							query.setParameterValue("ImportTasks", this.get("importTasks"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportTasksAll", this.get("importTasksFrom") === "importTasksAll",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportTasksFromFolders",
								this.get("importTasksFrom") === "importTasksFromFolders",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportTasksFolders", this.get("importTasksFolders"),
								Terrasoft.DataValueType.TEXT);
							query.setParameterValue("ExportActivities", this.get("exportActivities"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportAppointments", this.get("exportAppointments"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportTasks", this.get("exportTasks"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportActivitiesFromScheduler",
								this.get("exportActivitiesFromSheduler"), Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportActivitiesFromGroups",
								this.get("exportActivitiesFromGroups"), Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportActivitiesGroups", this.get("exportActivitiesGroups"),
								Terrasoft.DataValueType.TEXT);
							query.setParameterValue("ExportActivitiesAll",
								this.get("exportActivityFrom") === "exportActivitiesAll",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportActivitiesSelected",
								this.get("exportActivityFrom") === "exportActivitiesSelected",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("MailboxSyncSettings", this.get("mailboxSyncSettingsId"),
								Terrasoft.DataValueType.GUID);
						},

						/**
						 *
						 * @param {Terrasoft.InsertQuery|Terrasoft.UpdateQuery} query
						 */
						fillContactSyncSettingsQuery: function(query) {
							query.setParameterValue("ImportContacts", this.get("importContacts"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportContactsAll",
								this.get("contactImportFrom") === "importContactsAll",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ImportContactsFromFolders",
									this.get("contactImportFrom") === "importContactsFromFolders",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("LinkContactToAccount", this.get("bindAccountValue").value,
								Terrasoft.DataValueType.GUID);
							query.setParameterValue("ExportContacts", this.get("exportContacts"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportContactsAll",
								this.get("contactExportFrom") === "exportContactsAll",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportContactsSelected",
									this.get("contactExportFrom") === "exportContactsSelected",
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportContactsEmployers", this.get("exportContactsEmployers"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportContactsCustomers", this.get("exportContactsCustomers"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportContactsOwner", this.get("exportContactsOwner"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("ExportContactsFromGroups", this.get("exportContactsFromGroups"),
								Terrasoft.DataValueType.BOOLEAN);
							query.setParameterValue("MailboxSyncSettings", this.get("mailboxSyncSettingsId"),
								Terrasoft.DataValueType.GUID);
							query.setParameterValue("ImportContactsFolders", this.get("importContactsFolders"),
								Terrasoft.DataValueType.TEXT);
							query.setParameterValue("ExportContactsGroups", this.get("exportContactsGroups"),
								Terrasoft.DataValueType.TEXT);
						},

						/**
						 *
						 * @param {Object} scope
						 * @return {Terrasoft.InsertQuery}
						 */
						getInsertMailboxSyncSettings: function(scope) {
							var insert = Ext.create("Terrasoft.InsertQuery", {
								rootSchemaName: "MailboxSyncSettings"
							});
							var id = Terrasoft.utils.generateGUID();
							scope.set("mailboxSyncSettingsId", id);
							insert.setParameterValue("Id", id, Terrasoft.DataValueType.GUID);
							insert.setParameterValue("AutomaticallyAddNewEmails",
								scope.get("automaticallyAddNewEmails"), Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("EnableMailSynhronization", scope.get("enableMailSynchronization"),
								Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("EmailsCyclicallyAddingInterval",
								scope.get("emailsCyclicallyAddingInterval"), Terrasoft.DataValueType.INTEGER);
							insert.setParameterValue("SysAdminUnit", Terrasoft.SysValue.CURRENT_USER.value,
								Terrasoft.DataValueType.GUID);
							insert.setParameterValue("LoadAllEmailsFromMailBox", scope.get("downloadFrom") === "all",
								Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("MailServer", scope.get("mailServerValue").value,
								Terrasoft.DataValueType.GUID);
							insert.setParameterValue("UserName", scope.get("userName"), Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("UserPassword", scope.get("userPassword"),
								Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("SenderEmailAddress", scope.get("senderEmailAddress"),
								Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("MailboxName", scope.get("mailboxName"),
								Terrasoft.DataValueType.TEXT);
							insert.setParameterValue("IsShared", scope.get("mailboxType") === "public",
								Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("SendEmailsViaThisAccount", scope.get("sendEmailsViaThisAccount"),
								Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("IsDefault", scope.get("isDefault"),
								Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("LoadEmailsFromDate", scope.get("loadEmailsFromDate"),
								Terrasoft.DataValueType.DATE);
							insert.setParameterValue("IsAnonymousAuthentication",
								scope.get("isAnonymousAuthentication"), Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("MailSyncPeriod", scope.get("mailSyncPeriodValue").value,
								Terrasoft.DataValueType.GUID);
							insert.setParameterValue("ExchangeAutoSynchronization",
								scope.get("exchangeAutoSynchronization"), Terrasoft.DataValueType.BOOLEAN);
							insert.setParameterValue("ExchangeSyncInterval", scope.get("exchangeSyncInterval"),
								Terrasoft.DataValueType.INTEGER);
							return insert;
						},

						/**
						 *
						 */
						checkUserCredentials: function() {
							var scope = this;
							if (!scope.get("mailServerValue") || scope.get("userName") === "" ||
									scope.get("userPassword") === "") {
								Terrasoft.utils.showInformation(
									resources.localizableStrings.CantConnectWithoutCredentialsEx);
								return;
							}
							var data = {
								id: scope.get("mailServerValue") ? scope.get("mailServerValue").value : null,
								userName: scope.get("userName"),
								userPassword: scope.get("userPassword"),
								senderEmailAddress: scope.get("senderEmailAddress"),
								enableSync: scope.get("enableMailSynchronization"),
								sendEmail: false
							};
							this.requestService(data, "IsServerValid", function(request, success, response) {
								if (success) {
									var result = Ext.decode(response.responseText);
									if (result.IsServerValidResult.IsValid) {
										scope.getPreviousFoldersSettings(scope, scope.get("currentFolderClassName"));
									} else {
										Terrasoft.utils.showInformation(result.IsServerValidResult.Message, null, null,
											{buttons: ["ok"]});
									}
								}
							});
						},

						/**
						 *
						 * @param {Array} folders
						 * @param {String} folderClassName
						 */
						openGroupChoose: function(folders, folderClassName) {
							function additionalAction(folderClassName, args) {
								var result;
								switch (folderClassName) {
									case ExchangeNUIConstants.ExchangeFolder.ContactClass.Name:
										args.folders.shift();
										result = Ext.encode(args.folders);
										this.set("importContactsFolders", result);
										break;
									case ExchangeNUIConstants.ExchangeFolder.BPMContact.Name:
										args.folders.shift();
										result = Ext.encode(args.folders);
										this.set("exportContactsGroups", result);
										break;
									case ExchangeNUIConstants.ExchangeFolder.AppointmentClass.Name:
										args.folders.shift();
										result = Ext.encode(args.folders);
										this.set("importAppointmentsCalendars", result);
										break;
									case ExchangeNUIConstants.ExchangeFolder.TaskClass.Name:
										args.folders.shift();
										result = Ext.encode(args.folders);
										this.set("importTasksFolders", result);
										break;
									case ExchangeNUIConstants.ExchangeFolder.BPMActivity.Name:
										args.folders.shift();
										result = Ext.encode(args.folders);
										this.set("exportActivitiesGroups", result);
										break;
									default:
										break;
								}
							}

							var scope = this;
							var lookupPageId = sandbox.id + "_MailboxFolderSyncSettingsModule";
							var params = sandbox.publish("GetHistoryState");
							sandbox.publish("PushHistoryState", {hash: params.hash.historyState});
							var moduleName = "MailboxFolderSyncSettingsModule";
							sandbox.loadModule(moduleName, {
								renderTo: "centerPanel",
								id: lookupPageId,
								keepAlive: true
							});
							sandbox.subscribe("GetParams", function() {
								return {
									mailboxId: scope.get("mailboxSyncSettingsId"),
									mailboxName: scope.get("userName"),
									mailServerId: scope.get("mailServerValue")
										? scope.get("mailServerValue").value
										: null,
									mailboxPassword: scope.get("userPassword"),
									senderEmailAddress: scope.get("senderEmailAddress"),
									mailServerTypeId: scope.get("mailServerTypeId"),
									folders: folders,
									folderClassName: folderClassName
								};
							}, [lookupPageId]);
							sandbox.subscribe("ResultSelectedRows", function(args) {
								scope.set("newFolders" + folderClassName, args.folders);
								additionalAction.call(scope, folderClassName, args);
							}, [lookupPageId]);
						},

						/**
						 *
						 */
						saveFoldersSettings: function() {
							var scope = this;
							var folders = scope.get("newFolders" + ExchangeNUIConstants.ExchangeFolder.NoteClass.Name);
							if (Ext.isEmpty(folders)) {
								sandbox.publish("PushHistoryState", {hash: "MailboxSynchronizationSettingsModule"});
								return;
							}
							var mailboxId = scope.get("mailboxSyncSettingsId");
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "MailboxFoldersCorrespondence"
							});
							select.addColumn("Id");
							select.addColumn("ActivityFolder");
							select.addColumn("FolderPath");
							var filters = Ext.create("Terrasoft.FilterGroup");
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Mailbox", mailboxId));
							select.filters = filters;
							select.getEntityCollection(function(response) {
								var responseItems = response.collection.getItems();
								this.getMailboxFolderId(scope, folders, responseItems, mailboxId);
							}, this);
						},

						/**
						 *
						 * @param {Object} scope
						 * @param {Array} newFolders
						 * @param {Array} oldFolders
						 * @param {Guid} mailboxId
						 * @param {Guid} mailboxFolderId
						 */
						alignFoldersSettings: function(scope, newFolders, oldFolders, mailboxId, mailboxFolderId) {
							function queueFunction() {
								if (queueExecution.nextQueueExecution) {
									queueExecution = queueExecution.nextQueueExecution;
									queueExecution.bq.execute(queueFunction);
								} else {
									queueExecution.callback.call(scope, scope, mailboxId, newFolders, oldFolders);
								}
							}

							if (!newFolders || newFolders.length < 2) {
								return;
							}
							var rootId = newFolders[0].Id;
							var filteredArray = newFolders.filter(function(item) {
								return rootId === item.ParentId;
							});
							if (filteredArray.length > 0) {
								var queueExecution = scope.addBatchQueriesFolderSettings(filteredArray,
									{
										ParentId: newFolders,
										rootId: rootId,
										mailboxFolderId: mailboxFolderId,
										newFolders: newFolders,
										oldFolders: oldFolders,
										mailboxId: mailboxId,
										finallyCallback: scope.deleteOldFolders
									});
								queueExecution.bq.execute(queueFunction);
							} else {
								scope.deleteOldFolders(scope, mailboxId, newFolders, oldFolders);
							}
						},

						/**
						 *
						 * @param {Array} foldersArray
						 * @param {Object} params
						 * @return {Object}
						 */
						addBatchQueriesFolderSettings: function(foldersArray, params) {
							var childrenFolders = [];
							var queueExecution = {
								bq: null,
								nextQueueExecution: null,
								callback: null
							};
							var bq = Ext.create("Terrasoft.BatchQuery");

							function findAllChildrenAndAddToBQ(element) {
								var filteredArray = params.newFolders.filter(function(item) {
									return element.Id === item.ParentId;
								});
								if (filteredArray.length > 0) {
									childrenFolders = childrenFolders.concat(filteredArray);
								}
								if (!this.isArrayContainsPath(params.oldFolders, element.Path)) {
									var parentId = this.tryGetParent({
										ParentId: element.ParentId,
										rootId: params.rootId,
										mailboxFolderId: params.mailboxFolderId,
										newFolders: params.newFolders,
										oldFolders: params.oldFolders
									});
									bq.add(this.getActivityFolderInsert(element.Id, element.Name, parentId));
									bq.add(this.getMailboxFolderCorrespondenceInsert(
										{
											mailboxId: params.mailboxId,
											activityFolderId: element.Id,
											path: element.Path
										}));
								}
							}

							foldersArray.forEach(findAllChildrenAndAddToBQ.bind(this));
							queueExecution.bq = bq;
							if (childrenFolders.length > 0) {
								queueExecution.nextQueueExecution = this.addBatchQueriesFolderSettings(childrenFolders,
									params);
							} else {
								queueExecution.callback = params.finallyCallback;
							}
							return queueExecution;
						},

						/**
						 *
						 * @param {Objcet} scope
						 * @param {Guid} mailboxId
						 * @param {Array} newFolders
						 * @param {Array} oldFolders
						 */
						deleteOldFolders: function(scope, mailboxId, newFolders, oldFolders) {
							var bq = Ext.create("Terrasoft.BatchQuery");
							for (var i = 0; i < oldFolders.length; i++) {
								if (!scope.isArrayContainsPathProperty(newFolders, oldFolders[i].get("FolderPath"))) {
									bq.add(scope.getMailboxFolderCorrespondenceDelete(oldFolders[i].get("Id")));
								}
							}
							bq.execute(function() {
								sandbox.publish("PushHistoryState", {hash: "MailboxSynchronizationSettingsModule"});
							});
						},

						/**
						 *
						 * @param {Object} params
						 * @return {Terrasoft.InsertQuery}
						 */
						getMailboxFolderCorrespondenceInsert: function(params) {
							var insert = Ext.create("Terrasoft.InsertQuery", {
								rootSchemaName: "MailboxFoldersCorrespondence"
							});
							insert.setParameterValue("Mailbox", params.mailboxId, Terrasoft.DataValueType.GUID);
							insert.setParameterValue("ActivityFolder", params.activityFolderId,
								Terrasoft.DataValueType.GUID);
							insert.setParameterValue("FolderPath", params.path, Terrasoft.DataValueType.TEXT);
							return insert;
						},

						/**
						 * Создает запрос для удаления записис из таблицы MailboxFoldersCorrespondence
						 * (Соответствие папок активностей и папок почтового ящика).
						 * @param {Guid} id Идентификатор записи.
						 * @return {Terrasoft.DeleteQuery}
						 */
						getMailboxFolderCorrespondenceDelete: function(id) {
							var del = Ext.create("Terrasoft.DeleteQuery", {
								rootSchemaName: "MailboxFoldersCorrespondence"
							});
							var filters = Ext.create("Terrasoft.FilterGroup");
							filters.addItem(del.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Id", id));
							del.filters = filters;
							return del;
						},

						/**
						 *
						 * @param {Guid} activityFolderId
						 * @param {String} name
						 * @param {Guid} parentId
						 * @return {Terrasoft.InsertQuery}
						 */
						getActivityFolderInsert: function(activityFolderId, name, parentId) {
							var insert = Ext.create("Terrasoft.InsertQuery", {
								rootSchemaName: "ActivityFolder"
							});
							insert.setParameterValue("Id", activityFolderId, Terrasoft.DataValueType.GUID);
							insert.setParameterValue("Parent", parentId, Terrasoft.DataValueType.GUID);
							insert.setParameterValue("FolderType", "b97a5836-1cd0-e111-90c6-00155d054c03",
								Terrasoft.DataValueType.GUID);
							insert.setParameterValue("Name", name, Terrasoft.DataValueType.TEXT);
							return insert;
						},

						/**
						 *
						 * @param {Object} scope
						 * @param {Array} folders
						 * @param {Array} oldFolders
						 * @param {Guid} mailboxId
						 */
						getMailboxFolderId: function(scope, folders, oldFolders, mailboxId) {
							var select = Ext.create("Terrasoft.EntitySchemaQuery", {
								rootSchemaName: "ActivityFolder"
							});
							select.addColumn("Id");
							var filters = Ext.create("Terrasoft.FilterGroup");
							filters.addItem(select.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
								"Name", scope.get("mailboxName")));
							select.filters = filters;
							select.getEntityCollection(function(response) {
								var responseItems = response.collection.getItems();
								scope.alignFoldersSettings(scope, folders, oldFolders, mailboxId,
									responseItems[0].get("Id"));
							}, this);
						},

						/**
						 *
						 * @param {Object} params
						 * @return {*}
						 */
						tryGetParent: function(params) {
							var result;
							if (params.ParentId === params.rootId) {
								result = params.mailboxFolderId;
							} else {
								var parentId = params.newFolders.filter(function(element) {
									return element.Id === params.ParentId;
								});
								if (parentId && parentId.length > 0 && this.isArrayContainsPath(params.oldFolders,
										parentId[0].Path)) {
									var filteredOldFolders = params.oldFolders.filter(function(item) {
										return item.get("FolderPath") === parentId[0].Path;
									});
									var activityFolder = filteredOldFolders[0].get("ActivityFolder");
									result = activityFolder.value;
								} else {
									result = params.ParentId;
								}
							}
							return result;
						},

						/**
						 *
						 * @param {Array} array
						 * @param {String} item
						 * @return {boolean}
						 */
						isArrayContainsPath: function(array, item) {
							for (var i = 0; i < array.length; i++) {
								if (array[i].get("FolderPath") === item) {
									return true;
								}
							}
							return false;
						},

						/**
						 *
						 * @param {Array} array
						 * @param {String} item
						 * @return {boolean}
						 */
						isArrayContainsPathProperty: function(array, item) {
							for (var i = 0; i < array.length; i++) {
								if (array[i].Path === item) {
									return true;
								}
							}
							return false;
						},

						/**
						 *
						 * @param {Object} scope
						 * @param {String} folderClassName
						 */
						getPreviousFoldersSettings: function(scope, folderClassName) {
							var newFolders = scope.get("newFolders" + folderClassName);
							if (newFolders === undefined) {
								this.getFirstFoldersSettings.call(scope, folderClassName, function(folders) {
									this.set("newFolders" + folderClassName, folders);
									this.openGroupChoose.call(this, folders, folderClassName);
								}.bind(this));
							} else {
								this.openGroupChoose.call(scope, newFolders, folderClassName);
							}
						},

						/**
						 *
						 * @param {String} className
						 * @param {Function} callback
						 */
						getFirstFoldersSettings: function(className, callback) {
							var folders = [];
							var foldersParameterName;
							switch (className) {
								case ExchangeNUIConstants.ExchangeFolder.NoteClass.Name:
									var settingsId = this.get("mailboxSyncSettingsId");
									if (!settingsId) {
										callback.call(this, folders);
										return;
									}
									var select = Ext.create("Terrasoft.EntitySchemaQuery", {
										rootSchemaName: "MailboxFoldersCorrespondence"
									});
									select.addColumn("FolderPath");
									var filters = Ext.create("Terrasoft.FilterGroup");
									filters.addItem(select.createColumnFilterWithParameter(
										Terrasoft.ComparisonType.EQUAL, "Mailbox", settingsId));
									select.filters = filters;
									select.getEntityCollection(
										function(response) {
											var responseItems = response.collection.getItems();
											for (var i = 0; i < responseItems.length; i++) {
												folders.push({
													Path: responseItems[i].get("FolderPath")
												});
											}
											callback.call(this, folders);
										}, this);
									break;
								case ExchangeNUIConstants.ExchangeFolder.ContactClass.Name:
									foldersParameterName = "importContactsFolders";
									break;
								case ExchangeNUIConstants.ExchangeFolder.BPMContact.Name:
									foldersParameterName = "exportContactsGroups";
									break;
								case ExchangeNUIConstants.ExchangeFolder.AppointmentClass.Name:
									foldersParameterName = "importAppointmentsCalendars";
									break;
								case ExchangeNUIConstants.ExchangeFolder.TaskClass.Name:
									foldersParameterName = "importTasksFolders";
									break;
								case ExchangeNUIConstants.ExchangeFolder.BPMActivity.Name:
									foldersParameterName = "exportActivitiesGroups";
									break;
								default:
									break;
							}
							if (foldersParameterName) {
								var parameterValue = this.get(foldersParameterName);
								if (parameterValue) {
									folders = Ext.decode(parameterValue);
								}
								callback.call(this, folders);
							}
						},

						/**
						 *
						 * @param {Object} data
						 * @param {String} methodName
						 * @param {Function} callback
						 * @param {Number} timeout
						 */
						requestService: function(data, methodName, callback, timeout) {
							var provider = Terrasoft.AjaxProvider;
							var requestUrl = Terrasoft.workspaceBaseUrl + "/rest/MailboxSettingsService/" + methodName;
							provider.request({
								url: requestUrl,
								timeout: timeout || 60000,
								headers: {
									"Accept": "application/json",
									"Content-Type": "application/json"
								},
								method: "POST",
								jsonData: data,
								scope: this,
								callback: callback
							});
						}
					}
				});
				model.ajaxProvider = Terrasoft.AjaxProvider;
				return model;
			},

			/**
			 * Функция привязка модели к представлению с последующей отрисовкой представления
			 * @param {String} renderTo
			 */
			reRender: function(renderTo) {
				var view = this.getView();
				view.bind(this.viewModel);
				view.render(renderTo);
			},

			/**
			 * Инициализированная viewModel.
			 * @private
			 */
			viewModel: null,

			/**
			 *
			 * @param {String} renderTo
			 */
			render: function(renderTo) {
				sandbox.publish("ChangeHeaderCaption", {
					caption: resources.localizableStrings.TitleCaptionEx,
					dataViews: new Terrasoft.Collection()
				});
				sandbox.subscribe("NeedHeaderCaption", function() {
					sandbox.publish("InitDataViews", {caption: resources.localizableStrings.TitleCaptionEx});
				}, this);
				if (this.viewModel) {
					this.reRender(renderTo);
					return;
				}
				this.viewModel = this.getViewModel();
				this.viewModel.setSharedMailBoxVisible();
				this.viewModel.onPrepareMailSyncPeriodList(null, this.viewModel.get("mailSyncPeriodList"));
				this.viewModel.onPrepareBindAccountList(null, this.viewModel.get("bindAccountList"));
				var state = sandbox.publish("GetHistoryState");
				this.fillMailServerCollection(this.viewModel);
				if (state.state && state.state.id) {
					this.viewModel.set("mailboxSyncSettingsId", state.state.id);
					this.viewModel.getSettings(function() {
						this.reRender(renderTo);
					}, this);
				} else {
					this.reRender(renderTo);
				}
			},

			/**
			 *
			 */
			init: function() {
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
			}
		});

		return Terrasoft.MailboxSynchronizationSettingsPageModule;
	});