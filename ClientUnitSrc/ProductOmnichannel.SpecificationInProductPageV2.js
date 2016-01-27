// D9 Team
define("SpecificationInProductPageV2", [],
	function() {
		return {
			entitySchemaName: "SpecificationInProduct",
			methods: {
				/**
				 * Выполняет валидацию выбранной характеристики.
				 * Проверка уникальности характеристики для продукта.
				 * @protected
				 * @virtual
				 * @param callback Функция обратного вызова для асинхронной валидации
				 * @param scope Контекст выполнения
				 */
				validateSpecification:  function(callback, scope) {
					var result = {
						success: true
					};
					var product = this.get("Product");
					var specification = this.get("Specification");
					if (this.Ext.isEmpty(product) || this.Ext.isEmpty(specification)) {
						result.message = this.get("Resources.Strings.CantCheckSpecificationError");
						result.success = false;
						callback.call(scope || this, result);
						return;
					}
					if (this.isNewMode() || this.changedValues.Specification) {
						var select = this.Ext.create("Terrasoft.EntitySchemaQuery", {
							rootSchemaName: "SpecificationInProduct"
						});
						select.addAggregationSchemaColumn("Id", Terrasoft.AggregationType.COUNT, "IdCOUNT");
						select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Product", product.value));
						select.filters.addItem(Terrasoft.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
							"Specification", specification.value));
						select.getEntityCollection(function(response) {
							if (response.success) {
								if (response.collection.getCount() < 1) {
									result.message = this.get("Resources.Strings.CantCheckSpecificationError");
									result.success = false;
								} else {
									var selectResult  =  response.collection.getByIndex(0);
									var specificationsCount = selectResult.get("IdCOUNT");
									if (specificationsCount > 0) {
										result.message = this.get("Resources.Strings.SpecificationExists");
										result.success = false;
									}
								}
							} else {
								result.message = this.get("Resources.Strings.CantCheckSpecificationError");
								result.success = false;
							}
							callback.call(scope || this, result);
						}, this);
					} else {
						callback.call(scope || this, result);
					}
				},

				/**
				 * Выполняет асинхронную валидация карточки
				 * @protected
				 * @override
				 * @param callback Функция обратного вызова
				 * @param scope Контекст выполнения
				 */
				asyncValidate: function(callback, scope) {
					this.callParent([function(response) {
						if (!this.validateResponse(response)) {
							return;
						}
						Terrasoft.chain(
							function(next) {
								this.validateSpecification(function(response) {
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
				}
			},
			diff: /**SCHEMA_DIFF*/[
				{
					"operation": "insert",
					"parentName": "Header",
					"propertyName": "items",
					"name": "Product",
					"values": {
						"bindTo": "Product",
						"layout": { "column": 0, "row": 0, "colSpan": 12 },
						"enabled": false,
						"controlConfig": {
							"enableRightIcon": false
						}
					}
				}
			]/**SCHEMA_DIFF*/
		};
	});