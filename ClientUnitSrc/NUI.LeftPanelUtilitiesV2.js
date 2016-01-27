define("LeftPanelUtilitiesV2", ["ext-base", "terrasoft", "ConfigurationConstants", "profile!LeftPanelCollapsed"],
	function(Ext, Terrasoft, ConfigurationConstants, profile) {
	/**
	 * @class Terrasoft.configuration.LeftPanelUtilities
	 * Вспомогательный класс работы с левой боковой панелью приложения
	 */
	Ext.define("Terrasoft.configuration.LeftPanelUtilitiesV2", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.LeftPanelUtilitiesV2",

		/**
		 * Признак использования профиля.
		 * @private
		 * @type {Boolean}
		 */
		useProfile: true,

		/**
		 * Конструктор класса.
		 * @returns {Terrasoft.configuration.LeftPanelUtilities} Возвращает созданный экземпляр класса.
		 */
		constructor: function() {
			this.callParent(arguments);
			this.addEvents(
				/**
				 * @event
				 * Событие изменения свёрнутости левой панели.
				 */
				"collapsedChanged"
			);
			return this;
		},

		/**
		 * Устанавливает состояние свёрнутости в начальное положение.
		 * @public
		 */
		initCollapsedState: function() {
			var defaultCollapsed = this.getDefaultCollapsed();
			this.setCollapsed(defaultCollapsed);
		},

		/**
		 * Возвращает начальное значение свёрнутости левой панели.
		 * @protected
		 * @return {Boolean} Начальное значение свёрнутости левой панели.
		 */
		getDefaultCollapsed: function() {
			if (this.useProfile) {
				if (profile !== null) {
					return profile;
				} else {
					return true;
				}
			} else {
				return true;
			}
		},

		/**
		 * Возвращает текущее значение свёрнутости левой панели.
		 * @public
		 * @return {Boolean} Текущее значение свёрнутости левой панели.
		 */
		getCollapsed: function() {
			var body = Ext.getBody();
			return body.hasCls("left-panel-collapsed");
		},

		/**
		 * Изменяет значение свёрнутости левой панели на обратное.
		 * @public
		 */
		changeCollapsed: function() {
			var collapsed = this.getCollapsed();
			this.setCollapsed(!collapsed);
		},

		/**
		 * Изменяет значение свёрнутости левой панели.
		 * @param {Boolean} collapsed Признак свёрнутости.
		 * @public
		 */
		setCollapsed: function(collapsed) {
			var body = Ext.getBody();
			var internalCollapsed = this.getCollapsed();
			if (collapsed) {
				body.addCls("left-panel-collapsed");
			} else {
				body.removeCls("left-panel-collapsed");
			}
			if (internalCollapsed !== collapsed) {
				this.fireEvent("collapsedChanged", collapsed);
			}
			if (this.useProfile) {
				Terrasoft.utils.saveUserProfile("LeftPanelCollapsed", collapsed, false);
			}
		}

	});
	return Ext.create(Terrasoft.configuration.LeftPanelUtilitiesV2);
});