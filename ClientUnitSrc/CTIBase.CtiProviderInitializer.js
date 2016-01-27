define("CtiProviderInitializer", ["ext-base", "CtiProviderInitializerResources", "core", "terrasoft"],
	function(Ext, resources, core, Terrasoft) {
		return {
			/**
			 * Инициализует специфичные для cti-провайдера параметры.
			 * @protected
			 * @param {Terrasoft.BaseCtiProvider} ctiProvider cti-провайдер
			 * @param {String} ctiProviderName Название класса cti-провайдера.
			 * @param {Function} callback Функция обратного вызова.
			 */
			initCustomCtiProvider: function(ctiProvider, ctiProviderName, callback) {
				callback(ctiProvider);
			},

			/**
			 * Инициализирует cti-провайдер и вызывает функцию обратного вызова.
			 * @param {String} ctiProviderName Название класса cti-провайдера.
			 * @param {Function} callback Функция обратного вызова.
			 */
			initializeCtiProvider: function(ctiProviderName, callback) {
				var ctiProvider = Terrasoft[ctiProviderName];
				if (Ext.isEmpty(ctiProvider)) {
					if (!core.getModuleDescriptor(ctiProviderName)) {
						var message = Ext.String.format(resources.localizableStrings.NotSupportedCtiProviderMessage,
							ctiProviderName);
						throw new Terrasoft.UnsupportedTypeException({
							message: message
						});
					}
					require([ctiProviderName], function() {
						ctiProvider = Terrasoft[ctiProviderName];
						this.initCustomCtiProvider(ctiProvider, ctiProviderName, callback);
					}.bind(this));
				} else {
					this.initCustomCtiProvider(ctiProvider, ctiProviderName, callback);
				}
			}
		};
	}
);