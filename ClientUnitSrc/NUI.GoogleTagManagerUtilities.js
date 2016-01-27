define("GoogleTagManagerUtilities", ["ext-base", "terrasoft", "GoogleTagManagerUtilitiesResources",],
		function(Ext, Terrasoft, resources) {
			Ext.define("Terrasoft.configuration.GoogleTagManagerUtilities", {
				alternateClassName: "Terrasoft.GoogleTagManagerUtilities",
				singleton: true,

				/**
				 * Название продукта
				 * @protected
				 * @type {String}
				 */
				productName: Ext.emptyString,

				/**
				 * Редакция продукта
				 * @protected
				 * @type {String}
				 */
				productEdition: Ext.emptyString,

				/**
				 * Локализация
				 * @protected
				 * @type {String}
				 */
				primaryCulture: Ext.emptyString,

				constructor: function() {
					this.callParent();
					this.product = Terrasoft.SysSettings.querySysSettings([
						"ProductName", "ProductEdition", "PrimaryCulture"
					], function(values) {
						this.productName = Ext.util.Format.htmlDecode(values.ProductName);
						this.productEdition = values.ProductEdition;
						this.primaryCulture = values.PrimaryCulture.displayValue;
					}, this);
				},

				/**
				 * Выполняет отправку данных в Google Tag Manager
				 * @private
				 * @param {Object} data Значения параметров которые будут переданы в Google Tag Manager
				 */
				send: function(data) {
					if (window.dataLayer) {
						window.dataLayer.push({
							"event" : "bpmonlineInfo",
							"virtualUrl" : Ext.isEmpty(data.virtualUrl) ? undefined : data.virtualUrl,
							"productName" : this.productName,
							"productEdition" : this.productEdition,
							"primaryCulture" : this.primaryCulture,
							"moduleName" : Ext.isEmpty(data.moduleName) ? undefined : data.moduleName,
							"currentAction" : Ext.isEmpty(data.currentAction) ? undefined : data.currentAction,
							"primaryColumnValue" : Ext.isEmpty(data.primaryColumnValue)
									? undefined
									: data.primaryColumnValue,
							"typeModule" : Ext.isEmpty(data.typeModule) ? "UnknownModule" : data.typeModule
						});
					}
				},

				/**
				 * Выполняет отправку данных в Google Tag Manager
				 * @public
				 * @param {Object} data Значения параметров которые будут переданы в Google Tag Manager
				 */
				actionModule: function(data) {
					this.send({
						virtualUrl : data.virtualUrl,
						moduleName : data.moduleName,
						currentAction : data.currentAction,
						primaryColumnValue : data.primaryColumnValue,
						typeModule : data.typeModule
					});
				}
			});
			return Terrasoft.GoogleTagManagerUtilities;
		}
);