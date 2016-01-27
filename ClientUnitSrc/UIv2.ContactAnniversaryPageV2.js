define("ContactAnniversaryPageV2", ["ContactAnniversaryPageV2Resources", "ConfigurationConstants"],
	function(recources, ConfigurationConstants) {
		return {
			entitySchemaName: "ContactAnniversary",
			details: /**SCHEMA_DETAILS*/{}/**SCHEMA_DETAILS*/,
			methods: {
				/**
				 * Валидирует значения модели представления.
				 * Если присутствуют некорректные значения, выводит сообщение о необходимости заполнения первого.
				 * Иначе вызывается callback-функция.
				 * @protected
				 * @overridden
				 * @param {Function} callback callback-функция
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						this.Terrasoft.chain(
							function(next) {
								this.validateAnniversaryType(function(response) {
									if (this.validateResponse(response)) {
										next();
									}
								}, this);
							},
							function(next) {
								callback.call(scope, response);
								next();
							}, this);
					}, this]);
				},

				/**
				 * Валидирует тип знаменательного события.
				 * У контакта не может существовать две даты рождения.
				 * @protected
				 * @param {Function} callback callback-функция
				 * @param {Terrasoft.BaseSchemaViewModel} scope Контекст выполнения callback-функции
				 */
				validateAnniversaryType: function(callback, scope) {
					var anniversaryType = this.get("AnniversaryType");
					var contact = this.get("Contact");
					var result = {
						success: true
					};
					if (anniversaryType.value !== ConfigurationConstants.AnniversaryType.Birthday) {
						callback.call(scope || this, result);
					} else {
						var esq = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: this.entitySchemaName
						});
						esq.addColumn("Contact");
						esq.filters.addItem(esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"AnniversaryType", ConfigurationConstants.AnniversaryType.Birthday));
						esq.filters.addItem(esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Contact", contact.value));
						if (this.isEditMode()) {
							esq.filters.addItem(esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.NOT_EQUAL,
								"Id", this.get("Id")));
						}
						esq.getEntityCollection(function(response) {
							if (response.success) {
								if (response.collection.getCount() >= 1) {
									result.message = this.get("Resources.Strings.ValidateAnniversaryTypeMessage");
									result.success = false;
								}
							} else {
								return;
							}
							callback.call(scope || this, result);
						}, this);
					}
				}
			},
			diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
		};
	});