define("EmailConstants", ["terrasoft", "ConfigurationConstants"], function(Terrasoft, ConfigurationConstants) {
	/**
	 * @class Terrasoft.configuration.EmailConstants
	 * Класс EmailConstants содержит конфигурационные константы для почтовых сообщений.
	 */
	Ext.define("Terrasoft.configuration.EmailConstants", {
		extend: "Terrasoft.BaseObject",
		alternateClassName: "Terrasoft.EmailConstants",
        /**
         * Имя схемы в которой находятся почтовые сообщения.
         */
		entitySchemaName: "Activity",
        /**
         * Максимальное число символов, выводимое в боковой панели, для почтового сообщения.
         */
		NumberBodySymbols: 100,
		/**
		 * @enum
		 * Тип почтового сообщения.
		 */
		emailType: {
			/** Входящее. */
			INCOMING: ConfigurationConstants.Activity.MessageType.Incoming,
			/** Исходящее. */
			OUTGOING: ConfigurationConstants.Activity.MessageType.Outgoing,
			/** Черновик. */
			DRAFT: Terrasoft.GUID_EMPTY
		}
	});
	return Ext.create("Terrasoft.EmailConstants");
});
