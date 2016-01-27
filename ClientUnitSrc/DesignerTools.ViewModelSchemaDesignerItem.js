define("ViewModelSchemaDesignerItem", [], function() {

	/**
	 * @class Terrasoft.controls.ViewModelSchemaDesignerItem
	 */
	var viewModelSchemaDesignerItem = Ext.define("Terrasoft.controls.ViewModelSchemaDesignerItem", {
		extend: "Terrasoft.DraggableContainer",
		alternateClassName: "Terrasoft.ViewModelSchemaDesignerItem",
		dragActionsCode: 1,

		/**
		 * Идентификатор элемента.
		 * @type {String}
		 */
		itemId: null,

		/**
		 * Конфигурация картинки элемента
		 * @public
		 * @type {Object}
		 */
		imageConfig: null,

		/**
		 * Содержимое элемента.
		 * @type {String}
		 */
		content: null,

		/**
		 * Признак отображения кнопки удаления.
		 * @type {Boolean}
		 */
		isRemoveButtonVisible: false,

		/**
		 * Признак использования элемента.
		 * @type {Boolean}
		 */
		isUsed: false,

		/**
		 * Признак указующий на обязательность элемента.
		 * @type {Boolean}
		 */
		isRequired: false,

		/**
		 * Массив групп в которые можно перетаскивать элемент.
		 * @protected
		 * @type {String[]}
		 */
		draggableGroupNames: null,

		/**
		 * @inheritdoc Terrasoft.Draggable#grabbedClassName
		 * @overridden
		 */
		grabbedClassName: "grabbed",

		/**
		 * @inheritdoc Terrasoft.Draggable#dragCopy
		 * @overridden
		 */
		dragCopy: true,

		/**
		 * Объект параметров шаблона элемента в сетке.
		 * @protected
		 * @type {Object}
		 */
		tplConfig: {
			classes: {
				wrapClasses: ["view-model-schema-designer-item-wrap"],
				elClasses: ["view-model-schema-designer-item-el"],
				contentWrapClasses: ["view-model-schema-designer-item-content-wrap"],
				textWrapClasses: ["view-model-schema-designer-item-content-text-wrap"],
				imageWrapClasses: ["view-model-schema-designer-item-content-image-wrap"],
				imageClasses: ["view-model-schema-designer-item-content-image"],
				actionsWrapClasses: ["view-model-schema-designer-item-actions-wrap"]
			}
		},

		/**
		 * @inheritdoc Terrasoft.component#tpl
		 * @overridden
		 */
		tpl: [
			/* jshint ignore:start */
			'<div id="{id}-view-model-schema-designer-item-wrap" data-used="{isUsed}" data-required="{isRequired}"' +
			'		class="{wrapClasses}">',
				'<div id="{id}-view-model-schema-designer-item-el" class="{elClasses}">',
					'<div id="{id}-view-model-schema-designer-item-content" class="{contentWrapClasses}">',
						'<tpl if="hasIcon">',
							'<div class="{imageWrapClasses}">',
								'<img class="{imageClasses}" src="{imageUrl}"/>',
							'</div>',
						'</tpl>',
						'<tpl if="hasContent">',
							'<div class="{textWrapClasses}">',
								'{content}',
							'</div>',
						'</tpl>',
					'</div>',
					'<div class="view-model-schema-designer-item-content-right-image"></div>',
				'</div>',
				'<tpl if="isRemoveButtonVisible">',
					'<div class="{actionsWrapClasses}">',
						'{%this.renderItems(out, values)%}',
					'</div>',
				'</tpl>',
			'</div>'
			/* jshint ignore:end */
		],

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
				wrapEl: Ext.String.format("#{0}-view-model-schema-designer-item-wrap", this.id)
			};
			var tplData = this.callParent(arguments);
			this.applyTplClasses(tplData);
			tplData.hasContent = !!this.content;
			tplData.isRemoveButtonVisible = this.isRemoveButtonVisible;
			tplData.isUsed = this.isUsed;
			tplData.isRequired = this.isRequired;
			tplData.hasIcon = !!this.imageConfig;
			if (this.imageConfig) {
				tplData.imageUrl = Terrasoft.ImageUrlBuilder.getUrl(this.imageConfig);
			}
			tplData.content = Terrasoft.utils.common.encodeHtml(this.content);
			return tplData;
		},

		/**
		 * Обработчик клика по элементу действия элемента.
		 * @protected
		 * @param {String} tag Тэг действия.
		 * @param {String} itemId Идентификатор элемента.
		 */
		onActionItemClick: function(tag, itemId) {
			this.fireEvent("itemActionClick", tag, itemId);
		},

		/**
		 * @inheritdoc Terrasoft.component#init
		 * @overridden
		 */
		init: function() {
			var self = this;
			function actionHandler() {
				self.onActionItemClick(this.tag, self.itemId);
			}
			this.items = [{
				className: "Terrasoft.Button",
				style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
				tag: "remove",
				imageConfig: {
					source: Terrasoft.ImageSources.URL,
					url: "./resources/demo/grid-layout-edit/CancelButtonImage.png"
				},
				onClick: actionHandler
			}
			];
			this.callParent(arguments);
			this.addEvents(
					/**
					 * @event beforeColumnChange
					 * Срабатывает до изменения колонки.
					 */
					"itemActionClick",
					/**
					 * @event
					 * Событие неправильного перетаскивания.
					 */
					"invalidDrop",
					/**
					 * @event
					 * Событие перетаскивания над зоной вставки.
					 */
					"dragOver",
					/**
					 * @event
					 * Событие перетаскивания.
					 */
					"dragDrop"
			);
		},

		/**
		 * @inheritdoc Terrasoft.component#getBindConfig
		 * @overridden
		 */
		getBindConfig: function() {
			var bindConfig = this.callParent(arguments);
			var itemBindConfig = {
				draggableGroupNames: {
					changeMethod: "setDraggableGroupNames"
				},
				itemId: {
					changeMethod: "setItemId"
				},
				content: {
					changeMethod: "setContent"
				},
				imageConfig: {
					changeMethod: "setImageConfig"
				},
				isRemoveButtonVisible: {
					changeMethod: "setRemoveButtonVisible"
				},
				isUsed: {
					changeMethod: "setIsUsed"
				},
				isRequired: {
					changeMethod: "setIsRequired"
				}
			};
			Ext.apply(itemBindConfig, bindConfig);
			return itemBindConfig;
		},

		/**
		 * @inheritdoc Terrasoft.Draggable#getDraggableConfig
		 * @overridden
		 */
		getDraggableConfig: function() {
			var draggableConfig = {};
			draggableConfig[Terrasoft.DragAction.MOVE] = {
				handlers: {
					onDragDrop: function(event, cells) {
						var droppableInstance = cells[0].droppableInstance;
						var info = { layoutName: droppableInstance.tag };
						this.fireEvent("dragDrop", this, info);
						this.reRender();
					},
					onDragOver: function(event, cells) {
						Ext.dd.DragDropManager.dragCurrent.resetConstraints();
						var droppableInstance = cells[0].droppableInstance;
						var intersectionPosition = this.getIntersectionPosition(cells);
						var intersection = {
							column: intersectionPosition.column,
							row: intersectionPosition.row,
							layoutName: droppableInstance.tag
						};
						this.fireEvent("dragOver", this, intersection);
					},
					onInvalidDrop: function() {
						this.fireEvent("invalidDrop", this);
						this.reRender();
					}
				}
			};
			return draggableConfig;
		},

		/**
		 * Устанавливает группы в которые можно перетаскивать.
		 * @param {String[]} value перечень групп.
		 */
		setDraggableGroupNames: function(value) {
			if (this.draggableGroupNames === value) {
				return;
			}
			this.draggableGroupNames = value;
			if (this.allowRerender()) {
				this.reRender();
			}
		},

		/**
		 * @inheritdoc Terrasoft.Draggable#getGroupName
		 * @overridden
		 */
		getGroupName: function() {
			return this.draggableGroupNames;
		},

		/**
		 * Находит позицию в сетке для начала вставки.
		 * @protected
		 * @virtual
		 * @param {Array} cells Ячейки над которыми находится элемент.
		 * @return {{row: Number, column: Number}} Позиция в сетке для начала вставки.
		 */
		getIntersectionPosition: function(cells) {
			var cellEl = Ext.get(cells[0].id);
			return {
				row: parseInt(cellEl.getAttribute("data-row-index"), 10),
				column: parseInt(cellEl.getAttribute("data-column-index"), 10)
			};
		},

		/**
		 * Установка значение идентификатора элемента.
		 * @param {Number} value Индекс строки.
		 */
		setItemId: function(value) {
			if (this.itemId === value) {
				return;
			}
			this.itemId = value;
		},

		/**
		 * Устанавливает значение контента.
		 * @param {Number} value Индекс строки.
		 */
		setContent: function(value) {
			if (this.content === value) {
				return;
			}
			this.content = value;
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * Устанавливает признак отображения кнопки удаления.
		 * @param {Boolean} value Значение.
		 */
		setRemoveButtonVisible: function(value) {
			if (this.isRemoveButtonVisible === value) {
				return;
			}
			this.isRemoveButtonVisible = value;
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
		 * Устанавливает объект настроек изображения.
		 * @param {Boolean} value Значение.
		 */
		setIsUsed: function(value) {
			if (this.isUsed === value) {
				return;
			}
			this.isUsed = value;
			if (this.rendered) {
				this.reRender();
			}
		},

		/**
		 * Устанавливает объект настроек изображения.
		 * @param {Boolean} value Значение.
		 */
		setIsRequired: function(value) {
			if (this.isRequired === value) {
				return;
			}
			this.isRequired = value;
			if (this.rendered) {
				this.reRender();
			}
		}

	});

	return viewModelSchemaDesignerItem;

});