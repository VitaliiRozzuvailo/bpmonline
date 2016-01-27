define("ProductEntryPageUtils", ["terrasoft", "ProductEntryPageUtilsResources"],
		function() {
			var productEntryPageUtilsClass = Ext.define("Terrasoft.configuration.mixins.ProductEntryPageUtils", {
				alternateClassName: "Terrasoft.ProductEntryPageUtils",

				/**
				 * Добавляет колонки с суммой в запрос.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.EntitySchemaQuery} esq Запрос в таблицу текущей entity схемы.
				 */
				modifyAmountESQ: function(esq) {
					esq.addColumn("Amount");
					esq.addColumn("PrimaryAmount");
				},

				/**
				 * Обновяет значения полей с суммой из БД.
				 * @protected
				 * @virtual
				 * @param {Terrasoft.BaseModel} entity Запись с актуальными значениями сумм.
				 */
				updateAmountColumnValues: function(entity) {
					var updatedAmount = entity.get("Amount");
					var updatedPrimaryAmount = entity.get("PrimaryAmount");
					if (updatedAmount !== this.get("Amount") ||
							updatedPrimaryAmount !== this.get("PrimaryAmount")) {
						this.set("Amount", updatedAmount);
						this.set("PrimaryAmount", updatedPrimaryAmount);
					}
				},

				/**
				 * Загружает текущую запись из бд.
				 * @protected
				 * @param {Function} [callback] Функция обратного вызова.
				 * @param {Object} [scope] Контекст выполнения.
				 */
				updateAmountFromDB: function(callback, scope) {
					var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
						rootSchemaName: this.entitySchemaName
					});
					select.addColumn("Id");
					this.modifyAmountESQ(select);
					select.getEntity(this.get("Id"), function(result) {
						var entity = result.entity;
						if (result.success && entity) {
							this.updateAmountColumnValues(entity);
							if (callback) {
								callback.call(scope || this);
							}
						} else {
							var errorInfo = result.errorInfo;
							throw new Terrasoft.UnknownException({
								message: errorInfo.message
							});
						}
					}, this);
				},

				/**
				 * Обновляет сумму счета из БД после фин. пересчетов,
				 * @protected
				 * @param {Function} [callback] Функция обратного вызова.
				 * @param {Object} [scope] Контекст выполнения.
				 */
				updateAmount: function(callback, scope) {
					if (this.get("ShowSaveButton")) {
						this.updateAmountFromDB(callback, scope);
					} else {
						if (!this.isNewMode()) {
							this.set("IsEntityInitialized", false);
							this.loadEntity(this.get("Id"), function() {
								this.set("IsEntityInitialized", true);
								this.sendSaveCardModuleResponse(true);
								if (callback) {
									callback.call(scope || this);
								}
							}, this);
						}
					}
				},

				/**
				 * Выполняет постобработку сохранения записи
				 * @protected
				 * @virtual
				 * @param {String} detailName Название детали.
				 * @param {Function} [callback] Функция обратного вызова.
				 * @param {Object} [scope] Контекст выполнения.
				 */
				updateAmountAfterSave: function(detailName, callback, scope) {
					this.updateDetail({ detail: detailName });
					this.updateAmount(callback, scope);
				}
			});
			return Ext.create(productEntryPageUtilsClass);
		});
