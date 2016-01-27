define("CTIBaseCommunicationViewModel", ["CTIBaseCommunicationViewModelResources", "CommunicationUtils",
		"BaseCommunicationViewModel"],
	function(resources, CommunicationUtils) {

		/**
		 * @class Terrasoft.configuration.ActivitySectionGridRowViewModel
		 * Класс, который описывает модель представления детали средства связи.
		 */
		Ext.define("Terrasoft.configuration.CTIBaseCommunicationViewModel", {
			extend: "Terrasoft.BaseCommunicationViewModel",
			alternateClassName: "Terrasoft.CTIBaseCommunicationViewModel",

			/**
			 * Указывает является ли тип средства связи телефоном.
			 * @protected
			 * @param {Object} communicationType Тип средства связи.
			 * @return {Boolean} Возвращает true если тип средства связи относиться к телефонам.
			 */
			isPhoneType: function(communicationType) {
				var phoneCommunicationTypes = this.get("PhoneCommunicationTypes");
				return CommunicationUtils.isPhoneType(communicationType, phoneCommunicationTypes);
			},

			/**
			 * Указывает установлено ли соединение с телефонией.
			 * @protected
			 * @return {Boolean} Возвращает true если установлено соединение с телефонией.
			 */
			isConnected: function() {
				var ctiModel = Terrasoft.CtiModel;
				return ctiModel && ctiModel.get("IsConnected");
			},

			/**
			 * Получает конфигурацию изображения для иконки кнопки типа.
			 * @protected
			 * @overridden
			 * @return {Object} Возвращает конфигурацию изображения для кнопки типа.
			 */
			getTypeImageConfig: function() {
				var imageConfig = this.callParent(arguments);
				var type = this.get("CommunicationType");
				if (this.isPhoneType(type.value)) {
					imageConfig = resources.localizableImages.CallIcon;
				}
				return imageConfig;
			},

			/**
			 * Получает конфигурацию гиперссылки элемента управления.
			 * @param value
			 * @overridden
			 * @return {Object} Возвращает объект ссылки.
			 */
			getLinkUrl: function(value) {
				var link = this.callParent(arguments);
				var type = this.get("CommunicationType");
				if (this.isConnected() && type && this.isPhoneType(type.value)) {
					return {
						url: value,
						caption: value
					};
				}
				return link;
			},

			/**
			 * Устанавливает признак видимости кнопки совершения вызова.
			 * @protected
			 * @return {Boolean} Возвращает признак видимости кнопки для совершения вызова.
			 */
			getCallButtonVisibility: function() {
				var number = this.get("Number");
				return (Ext.isEmpty(number) || !this.isConnected()) ? false : true;
			},

			/**
			 * Устанавливает признак видимости кнопки совершения вызова.
			 * @overridden
			 * @return {Boolean} Возвращает признак видимости кнопки.
			 */
			getTypeIconButtonVisibility: function() {
				var visible = this.callParent(arguments);
				var communicationType = this.get("CommunicationType");
				visible = this.isPhoneType(communicationType.value) ? this.getCallButtonVisibility() : visible;
				return visible;
			},

			/**
			 * Обрабатывает нажатие на гиперссылку елемента управления.
			 * @overridden
			 */
			onLinkClick: function() {
				var communicationType = this.get("CommunicationType");
				if (this.isConnected() && this.isPhoneType(communicationType.value)) {
					this.call();
					return false;
				}
				return this.callParent(arguments);
			},

			/**
			 * Совершает звонок по текущему номеру телефона.
			 * @protected
			 */
			call: function() {
				var number = this.get("Number");
				var contact = this.get("Contact");
				var customerId = contact ? contact.value : this.get("Account").value;
				var entitySchemaName = contact ? "Contact" : "Account";
				this.sandbox.publish("CallCustomer", {
					number: number,
					customerId: customerId,
					entitySchemaName: entitySchemaName
				});
			},

			/**
			 * Формирует текст подсказки для кнопки.
			 * @overridden
			 * @return {String} Возвращает текст подсказки для кнопки совершения вызова.
			 */
			getTypeIconButtonHintText: function() {
				var communicationType = this.get("CommunicationType");
				if (this.isConnected() && this.isPhoneType(communicationType.value)) {
					return this.getCallButtonHintText();
				}
				return this.callParent(arguments);
			},

			/**
			 * Формирует текст подсказки для кнопки совершения вызова.
			 * @protected
			 * @return {String} Возвращает текст подсказки для кнопки совершения вызова.
			 */
			getCallButtonHintText: function() {
				var number = this.get("Number");
				if (Ext.isEmpty(number)) {
					return null;
				}
				return Ext.String.format(resources.localizableStrings.CallButtonHintText, number);
			}
		});

		return Terrasoft.CTIBaseCommunicationViewModel;
	});