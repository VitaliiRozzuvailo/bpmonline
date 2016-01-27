define("DesignerGridLayoutItem", ["ext-base", "terrasoft", "sandbox", "DesignerGridLayoutItemResources",
	"css!DesignerGridLayoutItem"],
	function(Ext, Terrasoft, sandbox, resources) {

		/**
		 * @class Terrasoft.controls.DesignerGridLayoutItem
		 * Класс элемента настройки сетки.
		 */
		var designerGridLayoutItem = Ext.define("Terrasoft.controls.DesignerGridLayoutItem", {
			extend: "Terrasoft.Label",
			alternateClassName: "Terrasoft.DesignerGridLayoutItem",

			/**
			 * Базовый css-класс для элемента управления.
			 * @protected
			 * @virtual
			 * @type {String}
			 */
			designerGridLayoutItemClasses: "",

			/**
			 * @inheritDoc Terrasoft.Label#labelClass
			 * @overridden
			 */
			labelClass: "designerGridLayoutItem-text",

			/**
			 * @inheritDoc Terrasoft.Label#tpl
			 * @overridden
			 */
			tpl: [
				"<div id='{id}-wrap' class='{designerGridLayoutItemClasses}'>",
				"<label id = {id} class = '{labelClass}'>{caption}",
				"</label>",
				"</div>"
			],

			/**
			 * @inheritDoc Terrasoft.Label#getTplData
			 * @overridden
			 */
			getTplData: function() {
				var tplData = this.callParent(arguments);
				var itemTplData = {
					designerGridLayoutItemClasses: this.designerGridLayoutItemClasses
				};
				Ext.apply(itemTplData, tplData, {});
				return itemTplData;
			},

			/**
			 * @inheritDoc Terrasoft.Label#init
			 * @overridden
			 */
			init: function() {
				this.callParent(arguments);
				this.addEvents(
						/**
						 * @event
						 * Событие двойного нажатия на кнопку.
						 * @param {Terrasoft.DesignerGridLayoutItem} this
						 */
						"dblclick"
				);
			},

			/**
			 * @inheritDoc Terrasoft.Label#initDomEvents
			 * @overridden
			 */
			initDomEvents: function() {
				this.callParent(arguments);
				var el = this.getWrapEl();
				el.on("dblclick", this.onDblClick, this);
			},

			/**
			 * Обработчик события двойного клика по элементу управления.
			 * @private
			 */
			onDblClick: function() {
				if (this.enabled) {
					this.fireEvent("dblclick", this);
				}
			},

			/**
			 * Вызывает виртуальный метод onDestroy по уничтожению объекта.
			 */
			destroy: function() {
				if (this.rendered) {
					var el = this.getWrapEl();
					el.un("dblclick", this.onDblClick, this);
				}
				this.callParent(arguments);
			},

			/**
			 * @inheritDoc Terrasoft.Label#getSelectors
			 * @overridden
			 */
			getSelectors: function() {
				return {
					wrapEl: "#" + this.id + "-wrap",
					el: "#" + this.id
				};
			}
		});

		return designerGridLayoutItem;
	});