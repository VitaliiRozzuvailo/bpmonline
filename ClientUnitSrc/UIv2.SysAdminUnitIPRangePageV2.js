define("SysAdminUnitIPRangePageV2", ["SysAdminUnitIPRange"],
	function(SysAdminUnitIPRange) {
		return {
			entitySchemaName: "SysAdminUnitIPRange",
			methods: {
				/**
				 * Проверяет соответсткие текста структуре IPv4.
				 * @param {String} value
				 * @return {Boolean} Возвращает логический результат валидации поля.
				 */
				validateIPv4: function(value) {
					var expr = new RegExp(this.get("Resources.Strings.IPv4RegexPattern"));
					var isValid = expr.test(value);
					if (isValid) {
						this.set("IPVersion", 4);
					}
					return isValid;
				},

				/**
				 * Проверяет соответствие текста структуре IPv6.
				 * @param {String} value
				 * @return {Boolean} Возвращает логический результат валидации поля.
				 */
				validateIPv6: function(value) {
					var expr = new RegExp(this.get("Resources.Strings.IPv6RegexPattern", "i"));
					var isValid = expr.test(value);
					if (isValid) {
						this.set("IPVersion", 6);
					}
					return isValid;
				},

				/**
				 * Проверяет обязательное поле при сохранении.
				 * @param {String} value
				 * @return {Object} Возвращает объект с текстами ошибок валидации поля.
				 */
				validateIPField: function(value) {
					var message = "";
					if (!value) {
						message = this.get("Resources.Strings.RequiredFieldIsEmptyMessage");
					} else {
						switch (this.get("IPVersion")) {
							case 4:
								if (!this.validateIPv4(value)) {
									message = this.get("Resources.Strings.NotMatchIPv4StructureMessage");
								}
								break;
							case 6:
								if (!this.validateIPv6(value)) {
									message = this.get("Resources.Strings.NotMatchIPv6StructureMessage");
								}
								break;
							default:
								if (!this.validateIPv4(value) && !this.validateIPv6(value)) {
									message = this.get("Resources.Strings.NotMatchIPStructureMessage");
								}
								break;
						}
					}
					return { invalidMessage: message };
				},

				/**
				 * @protected
				 * @inheritdoc BasePageV2#setValidationConfig.
				 * @overridden
				 */
				setValidationConfig: function() {
					this.callParent(arguments);
					this.addColumnValidator("BeginIP", this.validateIPField);
					this.addColumnValidator("EndIP", this.validateIPField);
				},

				/**
				 * Добавлена валидация полей начального и конечного IP адреса в диапазоне.
				 * @protected
				 * @inheritdoc BasePageV2#initEntity
				 * @overridden
				 */
				initEntity: function() {
					this.setValidationConfig();
					this.callParent(arguments);
				}
			},
			rules: {
			}
		};
	});