﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;

namespace StockMVC.Services
{
    public class FromYahooStock : IStockData
    {
        IEnumerable<IDictionary<string, string>> IStockData.Get(string name, DateTime from, DateTime to)
        {
            var url = String.Format(
                "http://ichart.finance.yahoo.com/table.csv?s={0}&a={1}&b={2}&c={3}&d={4}&e={5}&f={6}&ignore=.csv",
                name, from.Month, from.Day, from.Year,
                to.Month, to.Day, to.Year);

            using (WebClient web = new WebClient())
            {
                var result = web.DownloadString(url);
                return parse(result);
            }
        }

        IEnumerable<IDictionary<string, string>> parse(string csvData)
        {
            var rows = csvData.Split('\n');
            var list = new List<Dictionary<string, string>>();
            if (rows.Length < 2)
                return list;
            else
            {
                var fields = rows[0].Split(',');
                foreach (var row in rows.Skip(1))
                {
                    if (string.IsNullOrEmpty(row)) continue;
                    var record = new Dictionary<string, string>();
                    var values = row.Split(',');
                    for (var i = 0; i < fields.Length; i++)
                    {
                        record.Add(fields[i], values[i]);
                    }

                    list.Add(record);
                }
                return list;
            }
        }
    }
}