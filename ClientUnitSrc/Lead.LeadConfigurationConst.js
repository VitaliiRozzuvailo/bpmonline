define("LeadConfigurationConst", [], function() {
	var leadConst = {
		/** Справочник - Состояния квалификации*/
		QualifyStatus: {
			/** Квалификация */
			Qualification: "d790a45d-03ff-4ddb-9dea-8087722c582c",
			/** Распределение */
			Distribution: "14cfc644-e3ed-497e-8279-ed4319bb8093",
			/** Лид дисквалифицирован */
			Disqualified: "128c3718-771a-4d1e-9035-6fa135ca5f70",
			/** Перевод в продажу */
			TransferForSale: "ceb70b3c-985f-4867-ae7c-88f9dd710688",
			/** Ожидание продажи */
			WaitingForSale: "7a90900b-53b5-4598-92b3-0aee90626c56"
		},

		/**
		 * Справочник - Состояния лида
		 */
		LeadStatus: {
			/** Новый **/
			New: "bd3511f8-f36b-1410-4493-1c6f65e16a07",
			/** Квалифицирован как новый **/
			QualifiedAsNew: "7d372f02-f46b-1410-4593-1c6f65e16a07",
			/** Квалифицирован как существующий **/
			QualifiedAsExists: "7d3f3116-f46b-1410-4693-1c6f65e16a07"
		},

		/**
		 * Справочник - Зрелость потребности
		 */
		LeadTypeStatus: {
			/** Готов к продаже */
			ReadyToSale: "66F33ED8-53EF-48CF-ABF3-665749ECF6AC",
			/** Отсутствует интерес */
			Disinterest: "f78066d3-a73e-4e86-bb99-e477fcb94b28",
			/** Потребность закрыта */
			NeedClosed: "e7b0c327-7b90-4ee1-bb3e-2341c8cd51c3",
			/** Предполагается интерес */
			AssumedInterest: "a719c793-2909-4671-9115-d19da8da0067",
			/** Проявлен интерес */
			ThereIsInterest: "5b3d1046-fc16-45c8-a5a1-298dfc857546"
		},

		/**
		 * Справочник - Способ регистрации лида
		 */
		LeadRegisterMethod: {
			/** Добавлен вручную */
			AddedManual: "240ab9c6-4d7c-4688-b380-af44dd147d7a",
			/** Входящий звонок / e-mail */
			IncomingCallOrEmail: "d08186b2-b670-4fdf-9596-7654017f9255",
			/** Обращение */
			Case: "85275068-7b5b-424b-ac4d-f7050aee1eef",
			/** Лендинг */
			Landing: "ba097c3a-31cf-48a7-a196-84fad50efe8d",
			/** Создан автоматически */
			CreatedAutomatically: "2f65913c-ff62-40fb-9d01-1a3e2e893e0e"
		},

		/**
		 * Справочник - Канал лида
		 */
		LeadMedium: {
			/** Социальные сети */
			SocialNetwork: "fa3f5ad8-56da-4fcf-aa79-7033bdf62178",
			/** Email */
			Email: "e95c0d56-e773-4a7c-81d8-148619beebb0",
			/** Поисковая реклама */
			SearchAd: "33a3b3fe-fab9-4256-91bb-b574e021c70a",
			/** Другая online реклама */
			OtherOnlineAd: "7e9f5358-e4ff-4139-a23a-0bfc4a1f1bb5",
			/** Медийная реклама */
			MediaAd: "39b44989-6790-4231-9058-bcb149eeff80",
			/** Другие каналы */
			OtherMedia: "22bcd15d-99ac-4ed1-bda9-2cdf7ca566ef",
			/** Бесплатный поиск */
			FreeSearch: "ae811c69-d09f-4bfb-b619-71f4fb19fd14",
			/** Переход с другого сайта */
			ReferrerTraffic: "cd64d8c3-746a-4c73-93ad-09a75ae71501",
			/** Прямой трафик */
			DirectTraffic: "e896a7ac-a6fe-43aa-a2cd-161b0faf65bb",
			/** Offline реклама */
			OfflineAd: "93412ddd-98c1-4f6e-8d98-696875d057fb",
			/** Кампании */
			Campaigns: "4c870607-99b4-40d2-9b0c-50e2eca85c08"
		}
	};

	return {
		LeadConst: leadConst
	};
});