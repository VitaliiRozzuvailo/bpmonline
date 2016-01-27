define("ContactAnniversaryDetailV2", ["ConfigurationConstants"], function(ConfigurationConstants) {
	return {
		entitySchemaName: "ContactAnniversary",
		attributes: {
			/**
			 * Флаг, определяющий возможность добавлять День рождения на деталь "Знаменательные события"
			 * @Type {Boolean}
			 */
			"IsBirthdayEnabled": {
				dataValueType: Terrasoft.DataValueType.BOOLEAN,
				value: true
			}
		},
		methods: {

			/**
			 * Возвращает имя колонки для фильтрации по умолчанию.
			 * @overridden
			 * @return {String} Имя колонки.
			 */
			getFilterDefaultColumnName: function() {
				return "AnniversaryType";
			},

			/**
			 * Инициализирует проверку доступности добавления дня рождения на деталь.
			 * @overridden
			 */
			onDataChanged: function() {
				this.callParent(arguments);
				this.checkIsBirthdayEnabled();
			},

			/**
			 * Выполняет проверку доступности кнопки добавления знаменательного события с типом "День рождения".
			 * @protected
			 */
			checkIsBirthdayEnabled: function() {
				var gridData = this.getGridData();
				if (gridData && gridData.getCount() > 0) {
					gridData.each(function(item) {
						var type = item.get("AnniversaryType");
						if (type && type.value === ConfigurationConstants.AnniversaryType.Birthday) {
							this.set("IsBirthdayEnabled", false);
							return false;
						} else {
							this.set("IsBirthdayEnabled", true);
						}
					}, this);
				} else {
					this.set("IsBirthdayEnabled", true);
				}
			},

			/**
			 * @inheritDoc Terrasoft.BaseSchemaViewModel#initEditPages
			 * @protected
			 * @overridden
			 */
			initEditPages: function() {
				this.callParent(arguments);
				var editPages = this.get("EditPages");
				if (editPages) {
					var birthdayPage = editPages.get(ConfigurationConstants.AnniversaryType.Birthday);
					if (birthdayPage) {
						birthdayPage.set("Enabled", {"bindTo": "IsBirthdayEnabled"});
					}
				}
			}
		},
		diff: /**SCHEMA_DIFF*/[]/**SCHEMA_DIFF*/
	};
});
