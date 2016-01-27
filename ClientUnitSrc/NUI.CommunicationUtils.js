define("CommunicationUtils", ["CommunicationUtilsResources", "ConfigurationConstants"],
	function(resources, ConfigurationConstants) {
		/**
		 * Указывает является ли тип средства связи одним из типов соц. сетей.
		 * @protected
		 * @param {Object} communicationType Тип средства связи.
		 * @return {boolean} Возвращает true если тип средства связи относиться к социальным сетям.
		 */
		function isSocialNetworkType(communicationType) {
			if (!communicationType) {
				return false;
			}
			communicationType = communicationType.value || communicationType;
			return ConfigurationConstants.SocialNetworksCommunicationTypes.indexOf(communicationType) !== -1;
		}

		/**
		 * Указывает является ли тип средства связи телефоном.
		 * @protected
		 * @param {Object} communicationType Тип средства связи.
		 * @param {Object} phoneTypes Типы телефонов.
		 * @return {Boolean} Возвращает true, если тип средства связи относится к телефонам.
		 */
		function isPhoneType(communicationType, phoneTypes) {
			if (!communicationType) {
				return false;
			}
			communicationType = communicationType.value || communicationType;
			var phonesCommunicationTypes = phoneTypes || ConfigurationConstants.PhonesCommunicationTypes;
			return phonesCommunicationTypes.indexOf(communicationType) !== -1;
		}

		/**
		 * Указывает является ли тип средства связи Web ссылкой.
		 * @protected
		 * @param {Object} communicationType Тип средства связи.
		 * @return {boolean} Возвращает true если тип средства связи Web ссылка.
		 */
		function isWebType(communicationType) {
			if (!communicationType) {
				return false;
			}
			communicationType = communicationType.value || communicationType;
			return ConfigurationConstants.CommunicationTypes.Web.indexOf(communicationType) !== -1;
		}

		/**
		 * Указывает является ли тип средства связи Web ссылкой.
		 * @protected
		 * @param {Object} communicationType Тип средства связи.
		 * @return {boolean} Возвращает true если тип средства связи Web ссылка.
		 */
		function isEmailType(communicationType) {
			if (!communicationType) {
				return false;
			}
			communicationType = communicationType.value || communicationType;
			return ConfigurationConstants.CommunicationTypes.Email.indexOf(communicationType) !== -1;
		}

		/**
		 * Указывает является ли тип средства связи адресом Skype.
		 * @protected
		 * @param {Object} communicationType Тип средства связи.
		 * @return {boolean} Возвращает true если тип средства связи адрес Skype.
		 */
		function isSkypeType(communicationType) {
			if (!communicationType) {
				return false;
			}
			communicationType = communicationType.value || communicationType;
			var skypeId = ConfigurationConstants.Communications.UseForContacts.Predefined.Skype.value;
			return skypeId.indexOf(communicationType) !== -1;
		}

		return {
			isSocialNetworkType: isSocialNetworkType,
			isPhoneType: isPhoneType,
			isEmailType: isEmailType,
			isWebType: isWebType,
			isSkypeType: isSkypeType
		};
	});
