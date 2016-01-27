define("MultiCurrencyEditViewGenerator", ["ext-base", "terrasoft", "DesignViewGeneratorV2", "CtiContainerList"],
	function(Ext) {
		var viewGenerator = Ext.define("Terrasoft.configuration.MultiCurrencyEditViewGenerator", {
			extend: "Terrasoft.ViewGenerator",
			alternateClassName: "Terrasoft.MultiCurrencyEditViewGenerator",

			/**
			 * Удаляет из конфигурационного объекта заданные свойства.
			 * @param {Object} config Конфигурационный объект.
			 * @param {String[]} properties Массив имен свойств.
			 */
			deleteConfigProperties: function(config, properties) {
				if (Ext.isEmpty(properties)) {
					return;
				}
				properties.forEach(function(property) {
					delete config[property];
				});
			},

			/**
			 * Возвращает конфигурационный объект для связки свойства мультивалютного поля с методом или атрибутом
			 * модели.
			 * @protected
			 * @virtual
			 * @param {Object} viewConfig Описание представления элемента управления.
			 * @param {String} propertyName Название свойства представления.
			 */
			getPropertyBindingConfig: function(viewConfig, propertyName) {
				var property = viewConfig[propertyName];
				if (Ext.isEmpty(property)) {
					return null;
				}
				return property.bindTo || {"bindTo": property};
			},

			/**
			 * Генерирует конфигурацию представления для {Terrasoft.MultiCurrencyEdit}.
			 * @protected
			 * @virtual
			 * @param {Object} viewConfig Описание представления элемента управления.
			 * @param {Object} config Описание элемента управления.
			 * @return {Object} Сгенерированное представление MultiCurrencyEdit.
			 */
			generate: function(viewConfig, config) {
				this.init(config);
				var column = this.findViewModelColumn(viewConfig);
				var caption = viewConfig.caption || column.caption;
				var defaultMarkerValue = viewConfig.name + " " + caption;
				var controlConfig = {
					"value": {"bindTo": viewConfig.bindTo || viewConfig.name},
					"id": viewConfig.name + "Edit",
					"markerValue": viewConfig.markerValue || defaultMarkerValue,
					"className": "Terrasoft.MultiCurrencyEdit",
					"caption": caption,
					"primaryAmount": this.getPropertyBindingConfig(viewConfig, "primaryAmount"),
					"rate": this.getPropertyBindingConfig(viewConfig, "rate"),
					"currency": this.getPropertyBindingConfig(viewConfig, "currency"),
					"primaryCurrency": {"bindTo": "PrimaryCurrency"},
					"currencyRateList": {"bindTo": "CurrencyRateList"},
					"classes": {
						"controlWrapClass": ["control-width-15"],
						"currencyButtonWrapClass": ["currency-button", "label-wrap"]
					},
					"primaryAmountEnabled": !Ext.isEmpty(viewConfig.primaryAmountEnabled)
						? (viewConfig.primaryAmountEnabled.bindTo || viewConfig.primaryAmountEnabled)
						: true,
					"currencyEnabled": !Ext.isEmpty(viewConfig.currencyEnabled)
						? (viewConfig.currencyEnabled.bindTo || viewConfig.currencyEnabled)
						: true,
					"rateEnabled": !Ext.isEmpty(viewConfig.rateEnabled)
						? (viewConfig.rateEnabled.bindTo || viewConfig.rateEnabled)
						: true
				};
				this.deleteConfigProperties(viewConfig, ["id", "value", "caption", "primaryAmount", "rate", "currency",
					"primaryAmountEnabled", "currencyEnabled", "rateEnabled", "ruleConfig", "generator"]);
				Ext.apply(controlConfig, this.getConfigWithoutServiceProperties(viewConfig,
					["labelConfig", "labelWrapConfig", "caption", "textSize"]));
				this.applyControlConfig(controlConfig, viewConfig);
				return controlConfig;
			}
		});

		return Ext.create(viewGenerator);
	});