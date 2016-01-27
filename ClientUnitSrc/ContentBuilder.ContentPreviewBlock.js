define("ContentPreviewBlock", ["css!ContentPreviewBlock"], function() {

	/**
	 * @class Terrasoft.controls.ContentPreviewBlock
	 */
	Ext.define("Terrasoft.controls.ContentPreviewBlock", {
		extend: "Terrasoft.Component",
		alternateClassName: "Terrasoft.ContentPreviewBlock",
		mixins: {
			draggable: "Terrasoft.Draggable"
		},
		dragActionsCode: 1,

		/**
		 * Заголовок блока предпросмотра.
		 * @type {String}
		 */
		caption: null,

		/**
		 * Элементы блока.
		 * @type {Array}
		 */
		items: null,

		/**
		 * Конфигурация картинки элемента
		 * @public
		 * @type {Object}
		 */
		imageConfig: null,

		/**
		 * @inheritdoc Terrasoft.Draggable#dragCopy
		 * @overridden
		 */
		dragCopy: true,

		/**
		 * Массив групп в которые можно перетаскивать элемент.
		 * @protected
		 * @type {String[]}
		 */
		draggableGroupName: null,

		/**
		 * Признак видимости "подсказки" доступных drop-зон.
		 * @protected
		 * @type {Boolean}
		 */
		showDropZoneHint: true,

		/**
		 * Объект параметров шаблона элемента в сетке.
		 * @protected
		 * @type {Object}
		 */
		tplConfig: {
			classes: {
				wrapClasses: ["content-block-preview-wrap"],
				titleWrapClasses: ["content-block-title-wrap-class"],
				imageWrapClasses: ["content-block-image-wrap-class"],
				imageClasses: ["content-block-image-class"]
			}
		},

		/**
		 * @inheritdoc Terrasoft.component#tpl
		 * @overridden
		 */
		tpl: [
			/* jscs:disable */
			/* jshint quotmark: false */
			'<div id="{id}-content-block-preview-wrap" class="{wrapClasses}">',
				'<div class="{imageWrapClasses}">',
					'<img class="{imageClasses}" src="{imageUrl}"/>',
				'</div>',
				'<tpl if="!!caption">',
					'<div class="{titleWrapClasses}">',
						'{caption}',
					'</div>',
				'</tpl>',
			'</div>'
			/* jshint quotmark: double */
			/* jscs:enable */
		],

		/**
		 * Создает экземпляр модели
		 */
		constructor: function() {
			this.callParent(arguments);
			this.addEvents(
				"dragOver",
				"dragDrop",
				"invalidDrop"
			);
		},

		/**
		 * Виполняет применение параметров шаблона элемента управления.
		 * @protected
		 * @param {Object} tplData Объект параметров шаблона рендеринга элемента управления.
		 * @param {String} configNodeName Название свойства объекта шаблона настроек.
		 */
		applyTplConfigProperties: function(tplData, configNodeName) {
			Terrasoft.each(this.tplConfig[configNodeName], function(propertyValue, propertyName) {
				tplData[propertyName] = propertyValue;
			}, this);
		},

		/**
		 * Виполняет применение классов шаблона элемента управления.
		 * @protected
		 * @param {Object} tplData Объект параметров шаблона рендеринга элемента управления.
		 */
		applyTplClasses: function(tplData) {
			this.applyTplConfigProperties(tplData, "classes");
		},

		/**
		 * @inheritdoc Terrasoft.component#getTplData
		 * @overridden
		 */
		getTplData: function() {
			this.selectors = {
				wrapEl: Ext.String.format("#{0}-content-block-preview-wrap", this.id)
			};
			var tplData = this.callParent(arguments);
			this.applyTplClasses(tplData);
			tplData.caption = this.caption;
			if (this.imageConfig) {
				tplData.imageUrl = Terrasoft.ImageUrlBuilder.getUrl(this.imageConfig);
			}
			return tplData;
		},

		/**
		 * Возвращает объект дополнительных параметров инициализации элемента drag.
		 * @protected
		 * @return {Object} Объект дополнительных параметров инициализации элемента drag.
		 */
		getDraggableElementDefaultConfig: function() {
			return {
				isTarget: true,
				instance: this,
				tag: this.tag
			};
		},

		/**
		 * @inheritdoc Terrasoft.Draggable#getDraggableConfig
		 * @overridden
		 */
		getDraggableConfig: function() {
			var draggableConfig = {};
			draggableConfig[Terrasoft.DragAction.MOVE] = {
				handlers: {
					onDragOver: "onDragOver",
					onDragDrop: "onDragDrop",
					onInvalidDrop: "onDragDrop"
				}
			};
			return draggableConfig;
		},

		/**
		 * Обрабатывает события перетаскивания блока над зоной вставки.
		 * @protected
		 * @param {Object} event Объект события.
		 * @param {Array} crossedBlocks Массив пересекаемых элементов.
		 */
		onDragOver: function(event, crossedBlocks) {
			Terrasoft.each(crossedBlocks, function(crossedBlock) {
				if (Ext.isEmpty(crossedBlock.droppableInstance) && (!Ext.isEmpty(crossedBlock.config))) {
					this.fireEvent("dragOver", crossedBlock.config.tag);
					return false;
				}
			}, this);
		},

		/**
		 * Обрабатывает события вставки элемента.
		 * @protected.
		 */
		onDragDrop: function() {
			this.reRender();
			this.fireEvent("dragDrop");
		},

		/**
		 * Обрабатывает события невалидного перетаскивания элемента.
		 * @protected.
		 */
		onInvalidDrop: function() {
			this.reRender();
			this.fireEvent("invalidDrop");
		},

		/**
		 * @inheritdoc Terrasoft.component#getBindConfig
		 * @overridden
		 */
		getBindConfig: function() {
			var bindConfig = this.callParent(arguments);
			var itemBindConfig = {
				caption: {
					changeMethod: "setCaption"
				},
				tag: {
					changeMethod: "setTag"
				},
				imageConfig: {
					changeMethod: "setImageConfig"
				},
				draggableGroupName: {
					changeMethod: "setDraggableGroupName"
				}
			};
			Ext.apply(itemBindConfig, bindConfig);
			return itemBindConfig;
		},

		/**
		 * Установка значение заголовка элемента.
		 * @param {Number} value Индекс строки.
		 */
		setCaption: function(value) {
			if (this.caption === value) {
				return;
			}
			this.caption = value;
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * Установка значение идентификатора элемента.
		 * @param {Number} value Индекс строки.
		 */
		setTag: function(value) {
			if (this.tag === value) {
				return;
			}
			this.tag = value;
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * Устанавливает объект настроек изображения.
		 * @param {Object} value Значение.
		 */
		setImageConfig: function(value) {
			if (this.imageConfig === value) {
				return;
			}
			this.imageConfig = value;
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * Устанавливает группы в которые можно перетаскивать.
		 * @param {String[]} value перечень групп.
		 */
		setDraggableGroupName: function(value) {
			if (this.draggableGroupName === value) {
				return;
			}
			this.draggableGroupName = value;
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * @inheritdoc Terrasoft.Draggable#getGroupName
		 * @overridden
		 */
		getGroupName: function() {
			return this.draggableGroupName;
		},

		/**
		 * @inheritdoc Terrasoft.component#onAfterRender
		 * @overridden
		 */
		onAfterRender: function() {
			this.callParent(arguments);
			this.mixins.draggable.onAfterRender.apply(this, arguments);
		},

		/**
		 * @inheritdoc Terrasoft.component#onAfterReRender
		 * @overridden
		 */
		onAfterReRender: function() {
			this.callParent(arguments);
			this.mixins.draggable.onAfterReRender.apply(this, arguments);
		},

		/**
		 * @inheritdoc Terrasoft.component#onDestroy
		 * @overridden
		 */
		onDestroy: function() {
			this.mixins.draggable.onDestroy.apply(this, arguments);
			this.callParent(arguments);
		}
	});
	return Terrasoft.ContentPreviewBlock;
});
