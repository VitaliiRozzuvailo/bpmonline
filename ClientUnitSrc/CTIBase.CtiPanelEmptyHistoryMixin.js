define("CtiPanelEmptyHistoryMixin", ["AcademyUtilities", "ImageCustomGeneratorV2"],
	function(AcademyUtilities, ImageCustomGeneratorV2) {

		/**
		 * @class Terrasoft.configuration.mixins.CtiPanelEmptyHistoryMixin
		 * Миксин для показа сообщения при пустой истории звонков.
		 * @type {Terrasoft.BaseObject}
		 */
		Ext.define("Terrasoft.configuration.mixins.CtiPanelEmptyHistoryMixin", {
			extend: "Terrasoft.BaseObject",
			alternateClassName: "Terrasoft.CtiPanelEmptyHistoryMixin",

			/**
			 * Конфигурация для сообщения о пустом реестре.
			 * @private
			 * @type {Object}
			 */
			emptyMessageConfig: null,

			/**
			 * Инициализирует ссылку на справку.
			 * @protected
			 */
			initHelpUrl: function() {
				var contextHelpCode = "CallPageV2";
				var contextHelpId = 1024;
				var helpConfig = {
					callback: this.setHelpLink,
					scope: this,
					contextHelpId: contextHelpId,
					contextHelpCode: contextHelpCode
				};
				AcademyUtilities.getUrl(helpConfig);
			},

			/**
			 * Устанавливает полученную ссылку на статью в академии.
			 * @param {String} url Ссылка.
			 */
			setHelpLink: function(url) {
				this.set("HelpUrl", url);
			},

			/**
			 * Создает конфигурацию элемента, который будет показан, если в реестре нет элементов.
			 * @param {Object} config Преднастроенные опции.
			 * @return {Object} Полный набор настроек элемента.
			 * @protected
			 */
			prepareEmptyGridMessageConfig: function(config) {
				var emptyGridMessageProperties = this.emptyMessageConfig;
				var emptyGridMessageViewConfig = this.getEmptyGridMessageViewConfig(emptyGridMessageProperties);
				this.Ext.apply(config, emptyGridMessageViewConfig);
			},
			
			/**
			 * Возвращает конфигурацию представления сообщения о пустом реестре.
			 * @protected
			 * @param {Object} emptyGridMessageProperties Параметры сообщения о пустом реестре.
			 * @return {Object} Конфигурация представления сообщения о пустом реестре.
			 */
			getEmptyGridMessageViewConfig: function(emptyGridMessageProperties) {
				var config = {
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["empty-grid-message"]
					},
					items: []
				};
				var imgConfig = ImageCustomGeneratorV2.generateSimpleCustomImage({
					"onPhotoChange": this.Terrasoft.emptyFn,
					"classes": {
						"wrapClass": ["image-container"]
					},
					"items": [],
					"name": "emptyHistory"
				});
				imgConfig.imageSrc = this.getEmptySearchResultImageUrl();
				config.items.push(imgConfig);
				config.items.push({
					className: "Terrasoft.Container",
					classes: {
						wrapClassName: ["title"]
					},
					items: [
						{
							className: "Terrasoft.Label",
							caption: emptyGridMessageProperties.title,
							markerValue: "EmptyHistoryLabel"
						}
					]
				});
				var description = emptyGridMessageProperties.description;
				if (!this.Ext.isEmpty(description)) {
					var useStaticFolderHelpUrl = emptyGridMessageProperties.useStaticFolderHelpUrl;
					var helpUrl = (useStaticFolderHelpUrl) ? this.get("StaticFolderHelpUrl") : this.get("HelpUrl");
					var startTagPart = "";
					var endTagPart = "";
					if (!this.Ext.isEmpty(helpUrl)) {
						startTagPart = "<a target=\"_blank\" href=\"" + helpUrl + "\">";
						endTagPart = "</a>";
					}
					description = this.Ext.String.format(description, startTagPart, endTagPart);
					config.items.push({
						className: "Terrasoft.Container",
						classes: {
							wrapClassName: ["description t-label"]
						},
						items: [
							{
								selectors: {
									wrapEl: ".description"
								},
								className: "Terrasoft.HtmlControl",
								html: description
							}
						]
					});
				}
				return config;
			}
		});
	});
