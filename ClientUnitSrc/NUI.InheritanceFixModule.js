/**
 * П.Тарасов:
 * Переопределение методов базовых классов модели и последующий вызов метода callParent приводит
 * к рекурсивному вызову переопределенного метода.
 * Удалить после появления родителя у страниц.
 * Используеться в: EmailPage
 */
define('InheritanceFixModule', ['ext-base', 'terrasoft', 'sandbox'], function(Ext, Terrasoft, sandbox) {
	var baseViewModel = {
		loadEntity: function(primaryColumnValue, callback, scope) {
			var entitySchemaQuery = this.getEntitySchemaQuery();
			entitySchemaQuery.getEntity(primaryColumnValue, function(result) {
				this.isNew = false;
				var entity = result.entity;
				if (entity) {
					this.setColumnValues(entity);
					this.changedValues = {};
				}
				if (callback) {
					callback.call(scope || this, this);
				}
			}, this);
		}
	};

	return {
		BaseViewModel: baseViewModel
	};
});
