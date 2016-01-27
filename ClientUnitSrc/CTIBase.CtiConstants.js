define("CtiConstants", ["ext-base", "terrasoft", "CtiConstantsResources"],
	function(Ext, Terrasoft, resources) {

		/**
		 * Типы коммуникаций.
		 * @type {String}
		 */
		var communicationCodes = {
			/**
			 * Телефон.
			 */
			Phone: "Phone"
		};

		var callDirection = {
			Incoming: "1d96a65f-2131-4916-8825-2d142b1000b2",
			Outgoing: "53f71b5f-7e17-4cf5-bf14-6a59212db422",
			NotDefined: "c072be2c-3d82-4468-9d4a-6db47d1f4cca"
		};

		/**
		 * Числовые характеристики времени.
		 * @type {Object}
		 */
		var timeScale = {
			/** Количество миллисекунд в секунде.*/
			MillisecondsInSecond: 1000,
			/** Количество секунд в минуте.*/
			SecondsInMinute: 60,
			/** Минимальное натуральное число с двумя цифрами.*/
			MinTwoDigitNumber: 10
		};

		/**
		 * Числовые характеристики длительности разговора.
		 * @type {Object}
		 */
		var talkDuration = {
			/** Частота обновления длительности разговора.*/
			RefreshRate: 500
		};

		/** @enum
		 * Типы идентифицированных абонентов телефонии.
		 */
		var subscriberTypes = {
			/** Контакт */
			Contact: "Contact",
			/** Контрагент */
			Account: "Account",
			/** Сотрудник */
			Employee: "Employee"
		};

		/**
		 * Количество записей, которые следует выбрать из таблиц средств связи при идентификации абонента.
		 * @type {Number}
		 */
		var identificationMaxRowCount = 20;

		/**
		 * Количество символов в поле ввода номера, начиная с которых нужно инициализировать идентификацию по буквам.
		 * @type {Number}
		 */
		var identificationMinSymbolCount = 3;

		/**
		 * Количество последних символов, введенных через DTMF набор, которые нужно отображать.
		 * @type {Number}
		 */
		var dtmfMaxDisplayedDigits = 20;

		/**
		 * Идентификатор контекста сообщения запроса записей разговоров.
		 * @type {String}
		 */
		var callRecordsContextMessageId = "CallSectionGridRowCallRecords";

		/**
		 * @enum
		 * Тип звонка.
		 */
		var callType = {
			/** По умолчанию. */
			DEFAULT: "default",
			/** Входящий. */
			INCOMING: "incoming",
			/** Исходящий. */
			OUTGOING: "outgoing",
			/** Пропущенный. */
			MISSED: "missed"
		};

		return {
			CallType: callType,
			TalkDuration: talkDuration,
			TimeScale: timeScale,
			CommunicationCodes: communicationCodes,
			CallDirection: callDirection,
			SubscriberTypes: subscriberTypes,
			LocalizableStrings: resources.localizableStrings,
			IdentificationMaxRowCount: identificationMaxRowCount,
			IdentificationMinSymbolCount: identificationMinSymbolCount,
			DtmfMaxDisplayedDigits: dtmfMaxDisplayedDigits,
			CallRecordsContextMessageId: callRecordsContextMessageId
		};
	});