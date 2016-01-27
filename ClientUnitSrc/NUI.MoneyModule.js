define("MoneyModule", ["ext-base", "terrasoft"],
	function(Ext, Terrasoft) {

		function onLoadCurrencyRate(CurrencyId, currentyDate, foundCallback, notFoundCallback) {
			var esq = Ext.create("Terrasoft.EntitySchemaQuery", {
				rootSchemaName: "CurrencyRate"
			});
			esq.rowCount = 1;
			esq.addColumn("Id");
			esq.addColumn("Rate");
			esq.addColumn("Currency.Division", "Division");
			var startDate = esq.addColumn("StartDate");
			startDate.orderDirection = Terrasoft.OrderDirection.DESC;
			var filters = esq.filters;
			var filterNameCurrencyId = "FilterCurrencyRate";
			var filterCurrencyId = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.EQUAL,
				"Currency", CurrencyId);
			filters.add(filterNameCurrencyId, filterCurrencyId);
			if (Ext.isDate(currentyDate)) {
				var filterNameStartDate = "FilterStartDate";
				var filterStartDate = esq.createColumnFilterWithParameter(Terrasoft.ComparisonType.LESS_OR_EQUAL,
					"StartDate", currentyDate);
				filters.add(filterNameStartDate, filterStartDate);
			}
			esq.getEntityCollection(function(result) {
				var collection = result.collection;
				if (collection && collection.collection.length > 0) {
					var item = collection.collection.items[0].values;
					foundCallback.call(this, item);
				} else {
					notFoundCallback.call(this);
				}
			}, this);
		}

		function LoadCurrencyRate(currencyAttribute, currencyRateAttribute, currentyDate, callback) {
			var currency = this.get(currencyAttribute);
			if (Ext.isEmpty(currency)) {
				return;
			}
			onLoadCurrencyRate.call(this, currency.value, currentyDate,
				function(item) {
					this.set(currencyRateAttribute, item.Rate);
					if (callback) {
						callback.call(this);
					}
				}, function() {
					this.set(currencyRateAttribute, null);
				});
		}

		function RecalcCurrencyValue(currencyRateAttribute, currencyValueAttribute, baseValueAttribute, currencyDivision) {
			var baseValue = this.get(baseValueAttribute);
			if (Ext.isEmpty(baseValue)) {
				this.set(currencyValueAttribute, baseValue);
				return;
			}
			var currencyRate = this.get(currencyRateAttribute);
			if (Ext.isEmpty(currencyRate) || currencyRate <= 0) {
				return;
			}
			var division = (!!currencyDivision) ? currencyDivision : 1;
			var currencyValue = Math.round(baseValue * currencyRate / division * 100) / 100;
			if (this.get(currencyValueAttribute) !== currencyValue) {
				this.set(currencyValueAttribute, currencyValue);
			}
		}

		function RecalcBaseValue(currencyRateAttribute, currencyValueAttribute, baseValueAttribute, currencyDivision) {
			var currencyValue = this.get(currencyValueAttribute);
			if (Ext.isEmpty(currencyValue)) {
				this.set(baseValueAttribute, currencyValue);
				return;
			}
			var currencyRate = this.get(currencyRateAttribute);
			if (Ext.isEmpty(currencyRate) || currencyRate <= 0) {
				return;
			}
			var division = (!!currencyDivision) ? currencyDivision : 1;
			var baseValue = Math.round((currencyValue * division * 100) / currencyRate) / 100;
			if (this.get(baseValueAttribute) !== baseValue) {
				this.set(baseValueAttribute, baseValue);
			}
		}

		return {
			onLoadCurrencyRate: onLoadCurrencyRate,
			LoadCurrencyRate: LoadCurrencyRate,
			RecalcCurrencyValue: RecalcCurrencyValue,
			RecalcBaseValue: RecalcBaseValue
		};
	});