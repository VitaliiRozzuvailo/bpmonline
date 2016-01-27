define("LookupManager", ["RightUtilities", "object-manager", "LookupManagerItem"], function(RightUtilities) {

	/**
	 * @class Terrasoft.LookupManager
	 * @public
	 * Класс менеджера деталей.
	 */
	Ext.define("Terrasoft.manager.LookupManager", {
		extend: "Terrasoft.ObjectManager",
		alternateClassName: "Terrasoft.LookupManager",
		singleton: true,

		/**
		 * Убирать или нет дубли в результирующем наборе данных.
		 * @protected
		 * @type {Boolean}
		 */
		isDistinct: true,

		//region Properties: Protected

		/**
		 * Название класса элемента менеджера.
		 * @protected
		 * @type {String}
		 */
		itemClassName: "Terrasoft.LookupManagerItem",

		/**
		 * Название схемы.
		 * @protected
		 * @type {String}
		 */
		entitySchemaName: "Lookup",

		/**
		 * Признак доступности справочников для редактирования текущему пользователю.
		 * @protected
		 * @type {Boolean}
		 */
		canManageLookups: null,

		/**
		 * Объект соответствий свойств колонкам.
		 * @protected
		 * @type {Object}
		 */
		propertyColumnNames: {
			name: "Name",
			description: "Description",
			sysEntitySchemaUId: "SysEntitySchemaUId",
			sysPageSchemaUId: "SysPageSchemaUId",
			sysEntitySchemaName: "[SysSchema:UId:SysEntitySchemaUId].Name",
			sysLookup: "SysLookup"
		},

		/**
		 * Проверяет права пользователя на редактирование справочников, инициализирует внутренний параметр.
		 * @protected
		 * @virtual
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 */
		initCanManageLookups: function(callback, scope) {
			RightUtilities.checkCanExecuteOperation({
				operation: "CanManageLookups"
			}, function(result) {
				this.canManageLookups = result;
				callback.call(scope);
			}, this);
		},


		/**
		 * Проверяет инициализирован ли менеджер.
		 * @protected
		 * @throws {Terrasoft.InvalidObjectState}
		 * @throws {Terrasoft.UnauthorizedException}
		 */
		checkIsInitialized: function() {
			this.callParent(arguments);
			if (!this.getCanManageLookups()) {
				throw new Terrasoft.UnauthorizedException();
			}
		},

		// endregion

		//region Properties: Public

		/**
		 * Возвращает информацию о возможности редактирования справочников.
		 * @virtual
		 * @return {boolean} true - если текущий пользователь может редактировать справочники,
		 * false - в обратном случае.
		 */
		getCanManageLookups: function() {
			return !!this.canManageLookups;
		},

		/**
		 * Инициализирует элементы менеджера.
		 * @overridden
		 * @param {Object} config Конфигурационный объект.
		 * @param {Function} callback Функция обратного вызова.
		 * @param {Object} scope Контекст вызова callback-функции.
		 */
		initialize: function(config, callback, scope) {
			if (Ext.isEmpty(this.canManageLookups)) {
				this.initCanManageLookups(function() {
					if (this.getCanManageLookups()) {
						this.initialize(config, callback, scope);
					} else {
						this.initialized = true;
						callback.call(scope);
					}
				}, this);
			} else {
				this.callParent(arguments);
			}
		}

		// endregion

	});
	return Terrasoft.LookupManager;
});