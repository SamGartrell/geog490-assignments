# Final Project: Mapping Real-Time Stream Statuses

# Stream flow (cubic ft/sec) is the only parameter retrieved

these are retrieved with the following URL, whose time threshold runs from the present to 1 week prior (this avoids construing predictive readings as current statuses):
https://waterservices.usgs.gov/nwis/iv/?format=json&indent=on&stateCd=or&parameterCd=00060&siteStatus=active

todos:
- add a layer of tint above satellite to keep emphasis on data--layer shoiuld persist until up close
- change siteStatus param to "active" in urls
- add mean data to graph

more ideas:
- hatch charts (find a good oregon hatch chart list, scape by river name)