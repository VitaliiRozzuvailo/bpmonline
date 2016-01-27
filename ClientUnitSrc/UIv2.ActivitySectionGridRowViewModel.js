define("ActivitySectionGridRowViewModel", ["ext-base", "terrasoft", "BaseSectionGridRowViewModel"],
		function(Ext, Terrasoft) {

	/**
	 * @class Terrasoft.configuration.ActivitySectionGridRowViewModel
	 */
	Ext.define("Terrasoft.configuration.ActivitySectionGridRowViewModel", {
		extend: "Terrasoft.BaseSectionGridRowViewModel",
		alternateClassName: "Terrasoft.ActivitySectionGridRowViewModel",

		/**
		 * Возвращает значение всплывающей подсказки для элемента в расписании.
		 * @return {String} Значение всплывающей подсказки для элемента в расписании.
		 */
		getScheduleItemHint: function() {
			var timeFormat = Terrasoft.Resources.CultureSettings.timeFormat;
			var startDate = Ext.Date.format(this.get("StartDate"), timeFormat);
			var dueDate = Ext.Date.format(this.get("DueDate"), timeFormat);
			var title = this.get("Title");
			var account = this.get("Account");
			var accountDisplayValue = (account) ? account.displayValue + ": " : "";
			return Ext.String.format("{0}-{1} {2}{3}", startDate, dueDate, accountDisplayValue, title);
		},

		/**
		 * Возвращает статус элемента расписания.
		 * @return {Terrasoft.ScheduleItemStatus} Статус элемента расписания.
		 */
		getScheduleItemStatus: function() {
			var isFinished = this.get("Status.Finish");
			var dueDate = this.get("DueDate");
			if (dueDate <= new Date() && !isFinished) {
				return Terrasoft.ScheduleItemStatus.OVERDUE;
			} else if (isFinished) {
				return Terrasoft.ScheduleItemStatus.DONE;
			}
			return Terrasoft.ScheduleItemStatus.NEW;
		},

		/**
		 * Возвращает значение заголовка элемента в расписании.
		 * @return {String} Значение заголовка элемента в расписании.
		 */
		getScheduleItemTitle: function() {
			var title = this.get("Title");
			var account = this.get("Account");
			var accountDisplayValue = (account) ? account.displayValue + ": " : "";
			return Ext.String.format("{0}{1}", accountDisplayValue, title);
		},

		/**
		 * inheritdoc Terrasoft.BaseGridRowViewModel#getEntitySchemaQuery
		 */
		getEntitySchemaQuery: function() {
			var esq = this.callParent(arguments);
			if (!esq.columns.contains("Status.Finish")) {
				esq.addColumn("Status.Finish");
			}
			return esq;
		},

		/**
		 * inheritdoc Terrasoft.BaseViewModel#setColumnValues
		 */
		setColumnValues: function(entity) {
			this.set("Status.Finish", entity.get("Status.Finish"));
			this.callParent(arguments);
		},

		/**
		 * Обрабатывает событие изменения поля "Начало".
		 * @protected
		 * @param {Date} date Новое значение даты.
		 */
		onStartDateChanged: function(date) {
			this.set("StartDate", date);
			this.saveEntity(Terrasoft.emptyFn, this);
		},

		/**
		 * Обрабатывает событие изменения поля "Завершение".
		 * @protected
		 * @param {Date} date Новое значение даты.
		 */
		onDueDateChanged: function(date) {
			this.set("DueDate", date);
			this.saveEntity(Terrasoft.emptyFn, this);
		},

		/**
		 * Обрабатывает событие изменения поля "Заголовок".
		 * @protected
		 */
		onTitleChanged: Terrasoft.emptyFn,

		/**
		 * Обрабатывает событие изменения поля "Состояние".
		 * @protected
		 */
		onStatusChanged: Terrasoft.emptyFn

	});

	return Terrasoft.ActivitySectionGridRowViewModel;
});