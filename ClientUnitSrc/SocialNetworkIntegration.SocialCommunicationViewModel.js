define("SocialCommunicationViewModel", ["BaseCommunicationViewModel"], function() {
	Ext.define("Terrasoft.configuration.SocialCommunicationViewModel", {
		alternateClassName: "Terrasoft.SocialCommunicationViewModel",
		extend: "Terrasoft.BaseCommunicationViewModel",

		/**
		 * Обработчик события изменения состояния элемента чек-бокс.
		 * @protected
		 * @param {Boolean} value Состояние элемента чек-бокс.
		 */
		onSelectItem: function(value) {
			this.isDeleted = !value;
		},

		/**
		 * @inheritdoc Terrasoft.BaseCommunicationViewModel#getTypeButtonStyle
		 * @overridden
		 */
		getTypeButtonStyle: function() {
			var communicationType = this.get("CommunicationType");
			if (!communicationType) {
				return "red-communication-type";
			} else {
				return Terrasoft.controls.ButtonEnums.style.TRANSPARENT;
			}
		},

		/**
		 * Возвращает маркер для чек-бокса.
		 */
		getCheckBoxEditMarkerValue: function() {
			return Ext.String.format("{0} {1}", this.getIconTypeButtonMarkerValue(), "checkbox");
		}
	});
});
