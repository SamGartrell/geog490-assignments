# Final Project: Mapping Real-Time Stream Statuses

# Parameters retrieved (some streams may lack readings for certain parameters)
| Parameter | Code |
| --- | --- |
| water temp (C) | 00010 |
| mean stream depth (ft) | 00064 |
| water velocity (ft/sec) | 00055 |
| water turbidity (mg/L as silicon dioxide) | 00075 |
| water turbidity (nephelometric turbidity units) | 00076 |
| water turbidity (jackson units) | 00070 |
| water transparency (in) | 00077 |
| total weekly precip (in) | 00046 |

these are retrieved with the following URL, whose time threshold runs from the present to 1 week prior (this avoids construing predictive readings as current statuses):
https://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&stateCd=or&startDT=2023-04-13T13:34-0700&endDT=2023-04-20T13:34-0700&parameterCd=00010,00064,00055,00075,00076,00070,00077,00046&siteStatus=all

todos:
- add a layer of tint above satellite to keep emphasis on data--layer shoiuld persist until ~z17

more ideas:
- hatch charts (find a good oregon hatch chart list, scape by river name)