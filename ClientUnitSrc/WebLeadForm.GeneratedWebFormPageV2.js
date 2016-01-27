define("GeneratedWebFormPageV2", [
			"GeneratedWebFormPageV2Resources", "AcademyUtilities", "MultilineLabel",
			"css!MultilineLabel", "css!GeneratedWebFormPageV2CSS"
		],
		function(resources, AcademyUtilities) {
			return {
				entitySchemaName: "GeneratedWebForm",
				details: /**SCHEMA_DETAILS*/{
					Files: {
						schemaName: "FileDetailV2",
						entitySchemaName: "GeneratedWebFormFile",
						filter: {
							masterColumn: "Id",
							detailColumn: "GeneratedWebForm"
						}
					},
					LeadDefaults: {
						schemaName: "LeadDefaultsDetailV2",
						entitySchemaName: "LandingLeadDefaults",
						filter: {
							masterColumn: "Id",
							detailColumn: "Landing"
						}
					}
				}/**SCHEMA_DETAILS*/,
				attributes: {
					/**
					 * Url API.
					 */
					"ApiUrl": {
						"value": "",
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					/**
					 * Текст подсказки.
					 */
					"HelpText": {
						"value": "",
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					/**
					 * Url сервиса.
					 */
					"ServiceUrl": {
						"value": "",
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					/**
					 * Текст шаблона.
					 */
					"TemplateScript": {
						"value": "",
						"dataValueType": Terrasoft.DataValueType.TEXT,
						"type": Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					}

				},
				methods: {

					/**
					 * @inheritdoc BasePageV2#addSectionDesignerViewOptions
					 * @overridden
					 */
					addSectionDesignerViewOptions: Terrasoft.emptyFn,

					/**
					 * Сохраняет изменения в БД.
					 * @inheritdoc BasePageV2#save
					 * @overridden
					 */
					save: function() {
						this.callParent(arguments);
						this.initializeTemplateScript();
					},

					/**
					 * @inheritdoc BasePageV2#init
					 * @overridden
					 */
					init: function() {
						this.callParent(arguments);
						this.initHelpText();
					},

					/**
					 * Инициализирует текст подсказки для шаблона кода.
					 * @private
					 */
					initHelpText: function() {
						Terrasoft.chain(
								this.getLandingAcademyArticleUrl,
								this.getTrakingAcademyArticleUrl,
								this.setHelpText,
								this
						);
					},
					/**
					 * Получает ссылку на статью в академии про настройку
					 * лендинга на сайте клиента
					 * @param {function} next ледующая функция в цепочке.
					 * @private
					 */
					getLandingAcademyArticleUrl: function(next) {
						var helpConfig = {
							contextHelpId: 1083,
							contextHelpCode: this.getContextHelpCode() + "Add"
						};
						helpConfig.scope = this;
						helpConfig.callback = function(landingUrl) {
							this.set("LandingUrl", landingUrl);
							next();
						};
						AcademyUtilities.getUrl(helpConfig);
					},
					/**
					 * Получает ссылку на статью в академии про настройку
					 * трекинга лидов на сайте клиента
					 * @param {function} next ледующая функция в цепочке.
					 * @private
					 */
					getTrakingAcademyArticleUrl: function(next) {
						var helpConfig = {
							contextHelpId: 1082,
							contextHelpCode: this.getContextHelpCode() + "Traking"
						};
						helpConfig.scope = this;
						helpConfig.callback = function(trackingUrl) {
							this.set("TrackingUrl", trackingUrl);
							next();
						};
						AcademyUtilities.getUrl(helpConfig);
					},

					/**
					 * Формирует текст подсказки для шаблона кода,
					 * при этом заменяет макросы в строке на ссылки к Академии.
					 * @private
					 */
					setHelpText: function() {
						var landingUrl = this.get("LandingUrl");
						var trackingUrl = this.get("TrackingUrl");
						var text = resources.localizableStrings.TemplateGuideText;
						var startLandingUrlTag = "";
						var finishLandingUrlTag = "";
						if (!Ext.isEmpty(landingUrl)) {
							startLandingUrlTag = "<a target=\"_blank\" href=\"" + landingUrl + "\">";
							finishLandingUrlTag = "</a>";
						}

						var finishTrackingUrlTag = "";
						var startTrackingUrlTag = "";
						if (!Ext.isEmpty(trackingUrl)) {
							startTrackingUrlTag = "<a target=\"_blank\" href=\"" + trackingUrl + "\">";
							finishTrackingUrlTag = "</a>";
						}
						text = Ext.String.format(text, startLandingUrlTag, finishLandingUrlTag,
								startTrackingUrlTag, finishTrackingUrlTag);
						this.set("HelpText", text);
					},

					/**
					 * Объект содержит функции представляющие
					 * название макроса и реализацию преобразования.
					 */
					macros: {
						"<br>": function() {
							return "\n";
						},
						"##apiUrl##": function() {
							var value = this.get("ApiUrl");
							if (!Ext.isEmpty(value)) {
								return "\"" + value + "\"";
							}
							return "\"\"";
						},
						"##landingId##": function() {
							var value = this.get("Id");
							if (!Ext.isEmpty(value)) {
								return "\"" + value + "\"";
							}
							return "\"\"";
						},
						"##serviceUrl##": function() {
							var value = this.get("ServiceUrl");
							if (!Ext.isEmpty(value)) {
								return "\"" + value + "\"";
							}
							return "\"\"";
						},
						"##redirectUrl##": function() {
							var value = this.get("ReturnURL");
							if (!Ext.isEmpty(value)) {
								return "\"" + value + "\"";
							}
							return "\"\"";
						}
					},

					/**
					 * Заменяет макросы в тексте значениями.
					 * @param {String} text Текст с макросами.
					 * @returns {String} Текст с заменными макросами.
					 */
					replaceMacrosInText: function(text) {
						for (var macro in this.macros) {
							if (Ext.isFunction(this.macros[macro])) {
								var value = this.macros[macro].apply(this);
								text = text.split(macro).join(value);
							}
						}
						return text;
					},

					/**
					 * Инициализирует шаблон, заменяет макросы значениями.
					 * @private
					 */
					initializeTemplateScript: function() {
						Terrasoft.SysSettings.querySysSettings(["ApiUrl", "ServiceUrl", "ScriptTemplate"],
								function(settings) {
									var apiUrl = settings.ApiUrl;
									var serviceUrl = settings.ServiceUrl;
									var scriptTemplate = settings.ScriptTemplate;
									this.set("ApiUrl", apiUrl);
									if (Ext.isEmpty(serviceUrl)) {
										serviceUrl = Terrasoft.workspaceBaseUrl +
												"/ServiceModel/GeneratedWebFormService.svc/SaveWebFormLeadData";
									}
									this.set("ServiceUrl", serviceUrl);
									scriptTemplate = this.replaceMacrosInText(scriptTemplate);
									this.set("TemplateScript", scriptTemplate);
								}, this);
					},

					/**
					 * @inheritDoc BasePageV2#onEntityInitialized
					 * @overridden
					 */
					onEntityInitialized: function() {
						this.callParent(arguments);
						this.initializeTemplateScript();
					},

					/**
					 * Врзвращает объект ссылки.
					 * @returns {Object} Объект ссылки.
					 */
					getLink: function(value) {
						if (Terrasoft.isUrl(value)) {
							return {
								url: value,
								caption: value
							};
						}
						return {};
					},

					/**
					 * Возвращает объект ссылки для Адреса перехода.
					 * @returns {Object} Объект ссылки.
					 */
					getReturnURLLink: function() {
						var value = this.get("ReturnURL");
						if (!Ext.isEmpty(value)) {
							return this.getLink(value);
						}
						return {};
					},

					/**
					 * Возвращает объект ссылки для Адреса сайта.
					 * @returns {Object} Объект ссылки.
					 */
					getExternalURLLink: function() {
						var value = this.get("ExternalURL");
						if (!Ext.isEmpty(value)) {
							return this.getLink(value);
						}
						return {};
					},

					/**
					 * Обработчик клика по ссылке Адреса сайта.
					 * @returns {Boolean} Использовать ли обработчик клика по умолчанию.
					 */
					onExternalLinkClick: function() {
						var value = this.get("ExternalURL");
						if (!Ext.isEmpty(value)) {
							window.open(value, "_blank");
						}
						return false;
					},

					/**
					 * Обработчик клика по ссылке Адреса перехода.
					 * @returns {Boolean} Использовать ли обработчик клика по умолчанию.
					 */
					onReturnLinkClick: function() {
						var value = this.get("ReturnURL");
						if (!Ext.isEmpty(value)) {
							window.open(value, "_blank");
						}
						return false;
					}
				},
				diff: /**SCHEMA_DIFF*/[
					{
						"name": "Name",
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"layout": {"column": 0, "row": 0, "colSpan": 15}
						}
					},
					{
						"operation": "insert",
						"name": "State",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"layout": {"column": 16, "row": 0, "colSpan": 8},
							"contentType": Terrasoft.ContentType.ENUM
						}
					},
					{
						"name": "ExternalURL",
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"hasClearIcon": true,
							"showValueAsLink": true,
							"layout": {"column": 0, "row": 1, "colSpan": 24},
							"controlConfig": {
								"href": {"bindTo": "getExternalURLLink"},
								"linkclick": {"bindTo": "onExternalLinkClick"}
							}
						}
					},
					{
						"name": "Description",
						"operation": "insert",
						"parentName": "Header",
						"propertyName": "items",
						"values": {
							"layout": {"column": 0, "row": 2, "colSpan": 24}
						}
					},
					{
						"operation": "insert",
						"name": "TabSiteIntegration",
						"values": {
							"caption": {
								"bindTo": "Resources.Strings.IntegrationFormTabCaption"
							},
							"items": []
						},
						"parentName": "Tabs",
						"propertyName": "tabs"
					},
					{
						"operation": "insert",
						"name": "DefaultsTab",
						"values": {
							"caption": {
								"bindTo": "Resources.Strings.LeadDefaultsCaption"
							},
							"items": []
						},
						"parentName": "Tabs",
						"propertyName": "tabs"
					},
					{
						"name": "LeadDefaults",
						"operation": "insert",
						"parentName": "DefaultsTab",
						"propertyName": "items",
						"values": {"itemType": Terrasoft.ViewItemType.DETAIL}
					},
					{
						"name": "NotesTab",
						"operation": "insert",
						"parentName": "Tabs",
						"propertyName": "tabs",
						"values": {
							"caption": {
								"bindTo": "Resources.Strings.NotesTabCaption"
							},
							"items": []
						}
					},
					{
						"name": "ControlGroupPlaceForm",
						"operation": "insert",
						"parentName": "TabSiteIntegration",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"caption": {
								"bindTo": "Resources.Strings.HowToPlaceFormControlGroupCaption"
							},
							"tools": [],
							"items": [],
							"controlConfig": {
								"classes": ["detail place-form-control-group"]
							}
						}
					},
					{
						"name": "ControlGroupRedirect",
						"operation": "insert",
						"parentName": "TabSiteIntegration",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"caption": {
								"bindTo": "Resources.Strings.AfterFormFillControlGroupCaption"
							},
							"tools": [],
							"items": [],
							"controlConfig": {
								"classes": ["detail landing-redirect-control-group"]
							}
						}
					},
					{
						"name": "ReturnURL",
						"operation": "insert",
						"parentName": "ControlGroupRedirect",
						"propertyName": "items",
						"values": {
							"hasClearIcon": true,
							"showValueAsLink": true,
							"layout": {"column": 0, "row": 1, "colSpan": 24},
							"controlConfig": {
								"href": {"bindTo": "getReturnURLLink"},
								"linkclick": {"bindTo": "onReturnLinkClick"}
							}
						}
					},
					{
						"name": "Files",
						"operation": "insert",
						"parentName": "NotesTab",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.DETAIL
						}
					},
					{
						"name": "NotesControlGroup",
						"operation": "insert",
						"parentName": "NotesTab",
						"propertyName": "items",
						"values": {
							"itemType": Terrasoft.ViewItemType.CONTROL_GROUP,
							"items": [],
							"caption": {"bindTo": "Resources.Strings.NotesGroupCaption"},
							"controlConfig": {"collapsed": false}
						}
					},
					{
						"name": "Notes",
						"operation": "insert",
						"parentName": "NotesControlGroup",
						"propertyName": "items",
						"values": {
							"contentType": Terrasoft.ContentType.RICH_TEXT,
							"layout": {"column": 0, "row": 0, "colSpan": 24},
							"labelConfig": {"visible": false},
							"controlConfig": {
								"imageLoaded": {"bindTo": "insertImagesToNotes"},
								"images": {"bindTo": "NotesImagesCollection"}
							}
						}
					},
					{
						"name": "GuideTemplate",
						"operation": "insert",
						"parentName": "ControlGroupPlaceForm",
						"propertyName": "items",
						"values": {
							"className": "Terrasoft.MultilineLabel",
							"itemType": Terrasoft.ViewItemType.LABEL,
							"caption": {"bindTo": "HelpText"},
							"contentVisible": true,
							"classes": {
								"labelClass": ["template-guide-label"]
							}
						}
					},
					{
						"name": "TemplateScript",
						"operation": "insert",
						"parentName": "ControlGroupPlaceForm",
						"propertyName": "items",
						"values": {
							"contentType": Terrasoft.ContentType.LONG_TEXT,
							"labelConfig": {
								"visible": false
							},
							"controlConfig": {
								"height": "200px",
								"classes": ["template-script-text-box"],
								"fontSize": "10pt",
								"fontFamily": "Courier New, monospace"
							},
							"readonly": true
						}
					},
					{
						"operation": "merge",
						"name": "ViewOptionsButton",
						"values": {
							"visible": {"bindTo": "IsSectionVisible"}
						}
					}
				]/**SCHEMA_DIFF*/
			};
		});
