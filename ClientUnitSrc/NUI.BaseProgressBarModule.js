define("BaseProgressBarModule", ["terrasoft"], function(Terrasoft) {
	/**
	 *  @class Terrasoft.controls.BaseProgressBar
	 *  Класс для работы с индикатором прогресса по стадиям.
	 */
	var baseProgressBarClass = Ext.define("Terrasoft.controls.BaseProgressBar", {
		alternateClassName: "Terrasoft.BaseProgressBar",
		extend: "Terrasoft.Component",

		/**
		 * @inheritdoc Terrasoft.component#tpl
		 * @overridden
		 */
		tpl: [
			/* jshint quotmark: false  */
			'<div id="{id}-wrap" class="{wrapClass} ts-progress-bar-wrap" style="{wrapStyle}">',
				'<div id="{id}-items-wrap" class="ts-progress-bar-items-wrap">',
					'<tpl if="isCaptionVisible">',
						'<div id="{id}-caption" class="ts-progress-bar-caption">',
							'{caption}',
						'</div>',
					'</tpl>',
					'<input id="{id}-el" type="hidden" value="{value}">',
					'<div id="{id}-items" class="ts-progress-bar-items">',
						'{%this.renderItems(out, values)%}',
					'</div>',
				'</div>',
			'</div>'
			/* jshint quotmark: double */
		],

		/**
		 * {@link Ext.XTemplate Шаблон} для построения стадии.
		 * @protected
		 * @type {String[]}
		 */
		itemTpl: [
			/* jshint quotmark: false */
			'<div data-item-index="{index}" class="ts-progress-bar-item {wrapClass}" style="width:{width};">',
			'</div>'
			/* jshint quotmark: double */
		],

		/**
		 * Количество элементов (стадий) индикатора прогресса.
		 * @type {Number}
		 */
		maxValue: 5,

		/**
		 * Значение индикатора прогресса в диапазоне от 1 до {@link #maxValue maxValue}.
		 * @type {Object}
		 */
		value: null,

		/**
		 * Признак видимости текстовой подписи сверху.
		 * @type {Boolean}
		 */
		isCaptionVisible: false,

		/**
		 * Имя класса, который задает стиль активному элементу (стадии).
		 * @type {String}
		 */
		activeClassName: "ts-progress-bar-item-active",

		/**
		 * Имя класса, который задает стиль неактивному элементу (стадии).
		 * @type {String}
		 */
		inactiveClassName: "ts-progress-bar-item-inactive",

		/**
		 * Ширина элемента управления.
		 * @type {String}
		 */
		width: "",

		/**
		 * @inheritdoc Terrasoft.Component#init
		 * @overridden
		 */
		init: function() {
			this.callParent(arguments);
			this.selectors = {
				wrapEl: ""
			};
		},

		/**
		 * @inheritdoc Terrasoft.Component#getTplData
		 * @overridden
		 */
		getTplData: function() {
			var tplData = this.callParent(arguments);
			tplData.renderItems = this.renderItems;
			tplData.wrapStyle = {
				width: this.width
			};
			tplData.isCaptionVisible = true;
			var caption = (Ext.isEmpty(this.value)) ? "" : this.value.displayValue;
			tplData.caption = caption;
			tplData.value = caption;
			this.selectors.wrapEl = "#" + this.id + "-wrap";
			this.selectors.itemsWrapEl = "#" + this.id + "-items-wrap";
			return tplData;
		},

		/**
		 * Метод используется в шаблоне по-умолчанию при рендеринге элементов (стадий) индикатора.
		 * @protected
		 * @virtual
		 * @param {String[]} buffer Буфер для генерации HTML.
		 * @param {Object} renderData Объект параметров для шаблона.
		 */
		renderItems: function(buffer, renderData) {
			var self = renderData.self;
			var itemsData = [];
			var maxValue = (self.value) ? self.maxValue + 1 : 0;
			for (var i = 1; i < maxValue; i++) {
				var itemTplData = self.getItemTpl(i);
				var itemHtml = self.generateItemHtml(itemTplData);
				itemsData.push(itemHtml);
			}
			Ext.DomHelper.generateMarkup(itemsData, buffer);
		},

		/**
		 * Метод используется в шаблоне по-умолчанию при рендеринге элементов (стадий) индикатора.
		 * @protected
		 * @virtual
		 * @param {Number} index Номер элемента (стадии), начиная с 1.
		 * @return {Object} renderData Возвращает объект параметров для шаблона.
		 */
		getItemTpl: function(index) {
			var currentValue = (Ext.isEmpty(this.value)) ? 0 : this.value.value;
			return {
				wrapClass: (index <= currentValue) ? this.activeClassName : this.inactiveClassName,
				width: (100 / this.maxValue) + "%",
				index: index
			};
		},

		/**
		 * Генерирует HTML-разметку для эелемента (стадии) индикатора.
		 * @protected
		 * @virtual
		 * @param {Number} tplData Объект параметров для шаблона.
		 * @return {Object} Возвращает сгенерированный Html элемента (стадии).
		 */
		generateItemHtml: function(tplData) {
			var tpl = new Ext.XTemplate(this.itemTpl);
			return tpl.apply(tplData);
		},

		/**
		 * Возвращает конфигурацию привязки к модели. Реализует интерфейс миксина {@link Terrasoft.Bindable}.
		 * @overridden
		 */
		getBindConfig: function() {
			var bindConfig = this.callParent(arguments);
			var progressBarBindConfig = {
				value: {
					changeMethod: "setValue"
				},
				maxValue: {
					changeMethod: "setMaxValue"
				}
			};
			Ext.apply(progressBarBindConfig, bindConfig);
			return progressBarBindConfig;
		},

		/**
		 * Устанавливает значения элемента управления.
		 * @param {Object} value
		 */
		setValue: function(value) {
			var currentValue = this.value;
			if (!Ext.isEmpty(currentValue) && !Ext.isEmpty(value)) {
				if (currentValue === value ||
						(currentValue.value === value.value && currentValue.displayValue === value.displayValue)) {
					return;
				}
			}
			this.value = Terrasoft.deepClone(value);
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * Устанавливает количество элементов (стадий) индикатора прогресса.
		 * @param {Object} value
		 */
		setMaxValue: function(value) {
			if (this.maxValue === value) {
				return;
			}
			this.maxValue = value;
			if (this.rendered) {
				this.reRender();
			}
		}
	});
	Terrasoft.ViewItemType.PROGRESS_BAR = 30;
	Terrasoft.DataValueType.STAGE_INDICATOR = 30;
	return baseProgressBarClass;
});