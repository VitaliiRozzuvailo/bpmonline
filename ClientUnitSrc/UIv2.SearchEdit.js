/**
 * @class Terrasoft.controls.SearchEdit
 * Класс элемента управления ввода текста в однострочное поле с задержкой ввода значения перед поиском.
 */
Ext.define("Terrasoft.controls.SearchEdit", {
	extend: "Terrasoft.TextEdit",
	alternateClassName: "Terrasoft.SearchEdit",

	/**
	 * Идентификатор таймера задержки перед фильтрацией.
	 * @private
	 * @type {Number}
	 */
	timerId: 0,

	/**
	 * Задержка перед фильтрацией.
	 * Количество миллисекунд между вводом пользователем значения фильтра в элемент и началом фильтрации.
	 * @type {Number}
	 */
	searchDelay: 1000,

	/**
	 * Уничтожает таймер по его имени.
	 * @private
	 * @param {String} timerName Имя таймера.
	 */
	clearTimer: function(timerName) {
		if (this[timerName] !== null) {
			clearTimeout(this[timerName]);
			this[timerName] = null;
		}
	},

	/**
	 * Инициализирует элемент управления.
	 * @protected
	 * @overridden
	 */
	init: function() {
		this.callParent(arguments);
		this.addEvents(
			/**
			 * @event searchValueChanged
			 * Срабатывает, когда происходит изменение значения поиска.
			 */
			"searchValueChanged"
		);
	},

	/**
	 * Обработчик события клавиша отжата. Делает паузу {@link Terrasoft.SearchEdit#searchDelay}, после чего генерирует
	 * событие {@link Terrasoft.SearchEdit#searchValueChanged}.
	 * @param {Ext.EventObjectImpl} e Объект события.
	 * @protected
	 * @overridden
	 */
	onKeyUp: function(e) {
		this.callParent(arguments);
		this.clearTimer("timerId");
		if (!this.enabled || this.readonly) {
			return;
		}
		var value = this.getTypedValue();
		if (!e.isNavKeyPress()) {
			this.timerId = Ext.defer(function() {
				this.fireEvent("searchValueChanged", value, this);
			}, this.searchDelay, this);
		}
	}
});
