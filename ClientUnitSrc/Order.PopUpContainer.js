define("PopUpContainer", [], function() {
	/**
	 * @class Terrasoft.controls.PopUpContainer
	 * Контейнер, который реализует миксин выпадающего контейнера.
	 */
	Ext.define("Terrasoft.controls.PopUpContainer", {
		extend: "Terrasoft.Container",
		alternateClassName: "Terrasoft.PopUpContainer",

		mixins: {
			/**
			 * Миксин выпадающего контейнера.
			 */
			expandable: "Terrasoft.Expandable"
		},

		/**
		 * Идентификатор компонента, для внутренних элементов которого,
		 * по событию mousedown не закрывается выпадающий контейнер.
		 * @type {String}
		 */
		innerContainerId: null,

		/**
		 * @inheritdoc Terrasoft.Component#init
		 * @overridden
		 */
		init: function() {
			this.callParent(arguments);
			this.mixins.expandable.init.call(this);
			this.initEvents();
		},

		/**
		 * @inheritdoc Terrasoft.Component
		 * @overridden
		 */
		getBindConfig: function() {
			var bindConfig = this.callParent(arguments);
			var expandableBindConfig = this.mixins.expandable.getBindConfig();
			Ext.apply(bindConfig, expandableBindConfig);
			return bindConfig;
		},

		/**
		 * Инцициализация сообщений.
		 * @protected
		 */
		initEvents: function() {
			this.on("show", this.subscribeMouseDown, this);
			this.on("hide", this.unsubscribeMouseDown, this);
		},

		/**
		 * Подписка на событие mousedown документа.
		 * @protected
		 */
		subscribeMouseDown: function() {
			var doc = Ext.getDoc();
			doc.on("mousedown", this.onMouseDown, this);
		},

		/**
		 * Одписка от события mousedown документа.
		 * @protected
		 */
		unsubscribeMouseDown: function() {
			var doc = Ext.getDoc();
			doc.un("mousedown", this.onMouseDown, this);
		},

		/**
		 * @inheritdoc Terrasoft.Component#clearDomListeners
		 * @overridden
		 */
		clearDomListeners: function() {
			this.callParent(arguments);
			this.unsubscribeMouseDown();
		},

		/**
		 * Обработчик события нажатия мыши, произошедшего за пределами элемента управления и выпадающего окна.
		 * @protected
		 * @param {Event} e Событие mousedown.
		 */
		onMouseDown: function(e) {
			var expandableContainer = this.mixins.expandable.getContainer.call(this);
			var isInContainerWrap = this.withinItem(e, expandableContainer);
			var isInInnerItem = isInContainerWrap || this.checkEventInInnerItem(e);
			if (!isInContainerWrap && !isInInnerItem) {
				this.mixins.expandable.setExpanded.call(this, false);
			}
		},

		/**
		 * Проверяет, является ли целевой элемент события вложенным элементом для выпадающего контейнера.
		 * @private
		 * @param {Event} e Событие для проверки.
		 * @return {Boolean} true в случае положительного результата.
		 */
		checkEventInInnerItem: function(e) {
			var isWithin = false;
			if (this.innerContainerId) {
				var innerComponent = Ext.getCmp(this.innerContainerId);
				if (innerComponent) {
					isWithin = this.withinItem(e, innerComponent);
				}
			}
			return isWithin;
		},

		/**
		 * Проверяет является ли целевой элемент события дочерним для указаного компонента.
		 * @private
		 * @param {Event} event Элемент для проверки.
		 * @param {Ext.Component} component Элемент для проверки.
		 * @return {Boolean} true в случае положительного результата.
		 */
		withinItem: function(event, component) {
			var isWithin = !component || event.within(component.getWrapEl());
			if (!isWithin && component instanceof Terrasoft.AbstractContainer) {
				component.items.each(function(item) {
					if (item instanceof Terrasoft.Component) {
						isWithin = this.withinItem(event, item);
						if (isWithin) {
							return false;
						}
					}
				}, this);
			}
			if (!isWithin && component.listView instanceof Terrasoft.ListView) {
				isWithin =  this.withinItem(event, component.listView);
			}
			return isWithin;
		}
	});
});
