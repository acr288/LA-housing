#LA housing price change 1999-2018
https://acr288.github.io/LA-housing/
##About the project
The project "20 years of housing price change in Los Angeles" shows median housing prices by census tract for Los Angeles County, for select years/quarters between 1999-2018, in a form of a chloropleth map. The focus of the project is to show percent change in home prices between select years (for example from 1999-2018, or 2003-2018), with a focus on three neighborhoods of high price growth. Using the dropdown menu the user selects first and second years for comparison. A side bar profiles the three neighborhoods and the associated changes. Clicking on a cesus tract with data summons a popup that displays median prices for years one and two, and the percent change, as well as the census tract number.
##Background
Los Angeles has an enormous housing affordability problem. It is also a very big and diverse place, incorporating a multitude of neighborhoods and smaller independent cities (LA county or Greater LA). Predicting housing price trends is very difficult, and research has not found consistent correlations with factors that would help prediction models. I hope this map may be of help to 1) those looking to buy a first home 2) scholars and activists who are trying to shed light on gentrification and its impacts 3) anyone trying to address the LA housing crisis by examining historical trends.
There is a complicated relationship between inflation and housing prices. The cost of housing is once of the main components of CPI; therefore housing costs drive the inflaion, albeit in a non-linear, non-straight-forward way. Owned housing costs were used directly in CPI calculations until the 80s, when they were replaced by rent or morgage-to-rent conversion. Because of the steep increases in home prices recently, some economists say that if we still used the old CPI, the inflation rates would be even higher. However, others caution that there is a lag between increase in housing costs and CPI, therefore recent increases are not yet felt in the official inflation index. Sources: https://www.nytimes.com/2022/05/24/technology/inflation-measure-cpi-accuracy.html, https://www.whitehouse.gov/cea/written-materials/2021/09/09/housing-prices-and-inflation/
##Data
The raw data is median home prices for Los Angeles County by census tract for select years/quarters between 1999-2018 in Excel format. Obtaining a set of data for every year is too expensive. The data was purchased from Dataquick (name has since changed) by Dr. James Craine, geographer and husband of Aleksandra, cleaned up, and converted into csv from Excel. All records containing null values have been ommitted from the analysis. Zero values mean no sales have been reported during that time period; those were also excluded from the analysis because they would produce an error in the calculation. The geographic data is a geojson of LA County census tracts for 2010, downloaded from https://data.lacounty.gov/Geospatial/Census-Tracts-2010/ay2y-b9rg
The data were joined using QGIS
##Technology
MS Excel, QGIS 3.16.6, VSCode, Leaflet, Github Pages, Github Desktop, OpenStreetMap tiles
###See my portfolio
https://acr288.github.io/