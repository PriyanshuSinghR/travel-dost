import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import type { Route } from "./+types/create-trip";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, capitalizeWords } from "~/lib/utils";
import {
  LayerDirective,
  LayersDirective,
  MapsComponent,
  Marker,
  MarkerDirective,
  MarkersDirective,
  Inject,
  Marker as MarkerService,
  Zoom,
} from "@syncfusion/ej2-react-maps";
import React, { useEffect, useState, useRef } from "react";
import { world_map } from "~/constants/world_map";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";
import { Header } from "components";
import { cityList } from "~/constants/country_city";

const CreateTrip = ({ loaderData }: Route.ComponentProps) => {
  const countries = cityList.map((country: any) => ({
    name: country.emoji + country.name,
    coordinates: [country.latitude, country.longitude],
    value: country.name,
    latitude: parseFloat(country.latitude),
    longitude: parseFloat(country.longitude),
  })) as Country[];

  const navigate = useNavigate();
  const mapRef = useRef<MapsComponent>(null);

  const [formData, setFormData] = useState<TripFormData>({
    country: "",
    state: "",
    city: "",
    travelStyle: "",
    interest: "",
    budget: "",
    duration: 0,
    groupType: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [mapConfig, setMapConfig] = useState({
    zoomSettings: {
      enable: false, // Disable user zoom control
      zoomFactor: 1,
      centerPosition: { latitude: 0, longitude: 0 },
      maxZoom: 10,
      minZoom: 1,
      shouldZoomInitially: true,
      enablePanning: false, // Disable panning
      enableSelectionZooming: false, // Disable selection zooming
    },
    mapData: [],
    shapeData: world_map,
    markers: [],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (
      !formData.country ||
      !formData.travelStyle ||
      !formData.interest ||
      !formData.budget ||
      !formData.groupType
    ) {
      setError("Please provide values for all fields");
      setLoading(false);
      return;
    }

    if (formData.duration < 1 || formData.duration > 10) {
      setError("Duration must be between 1 and 10 days");
      setLoading(false);
      return;
    }
    const user = await account.get();
    if (!user.$id) {
      console.error("User not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: formData.country,
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id,
        }),
      });

      const result: CreateTripResponse = await response.json();

      if (result?.id) navigate(`/trips/${result.id}`);
      else console.error("Failed to generate a trip");
    } catch (e) {
      console.error("Error generating trip", e);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: keyof TripFormData, value: string | number) => {
    setFormData({ ...formData, [key]: value });
  };

  const getCountryShapeData = (countryName: string) => {
    const countryFeatures = world_map.features?.filter(
      (feature) =>
        feature.properties.name === countryName ||
        feature.properties.NAME === countryName ||
        feature.properties.name_en === countryName
    );

    if (countryFeatures && countryFeatures.length > 0) {
      return {
        ...world_map,
        features: countryFeatures,
      };
    }

    return world_map;
  };

  const getStateShapeData = (countryName: string, stateName: string) => {
    const countryShapeData = getCountryShapeData(countryName);
    const modifiedFeatures = countryShapeData.features?.map((feature) => {
      return {
        ...feature,
        properties: {
          ...feature.properties,
          state: stateName,
          name: stateName, // This will be used for matching
        },
      };
    });

    return {
      ...countryShapeData,
      features: modifiedFeatures || [],
    };
  };

  //   const getStateShapeData = (countryName: string, stateName: string) => {
  //     return getCountryShapeData(countryName);
  //   };

  const updateMapConfiguration = () => {
    const selectedCountry = cityList.find((c) => c.name === formData.country);
    const selectedState = selectedCountry?.states?.find(
      (s) => s.name === formData.state
    );
    const selectedCity = selectedState?.cities?.find(
      (c) => c.name === formData.city
    );

    let newConfig = {
      zoomSettings: {
        enable: false,
        zoomFactor: 1,
        centerPosition: { latitude: 0, longitude: 0 },
        maxZoom: 10,
        minZoom: 1,
        shouldZoomInitially: true,
        enablePanning: false,
        enableSelectionZooming: false,
      },
      mapData: [],
      shapeData: world_map,
      markers: [],
    };

    if (formData.city && selectedCity && selectedState && selectedCountry) {
      // City selected - zoom to state area using state's lat/long, show city marker in red
      newConfig = {
        ...newConfig,
        zoomSettings: {
          ...newConfig.zoomSettings,
          zoomFactor: 8,
          centerPosition: {
            latitude: parseFloat(selectedState.latitude),
            longitude: parseFloat(selectedState.longitude),
          },
        },
        shapeData: getCountryShapeData(formData.country),
        mapData: [
          {
            name: formData.state,
            color: "#E5E5E5", // State in light gray
          },
        ],
        markers: [
          {
            latitude: parseFloat(selectedCity.latitude),
            longitude: parseFloat(selectedCity.longitude),
            name: selectedCity.name,
            color: "#EA382E",
          },
        ],
      };
    } else if (formData.state && selectedState && selectedCountry) {
      // State selected - zoom to country area using country's lat/long, show state in red
      newConfig = {
        ...newConfig,
        zoomSettings: {
          ...newConfig.zoomSettings,
          zoomFactor: 5,
          centerPosition: {
            latitude: parseFloat(selectedCountry.latitude),
            longitude: parseFloat(selectedCountry.longitude),
          },
        },
        shapeData: getStateShapeData(formData.country, formData.state),
        mapData: [
          {
            name: formData.state,
            color: "#EA382E", // State in red
          },
        ],
        markers: [],
      };
    } else if (formData.country && selectedCountry) {
      // Country selected - show country colored on world map
      newConfig = {
        ...newConfig,
        zoomSettings: {
          ...newConfig.zoomSettings,
          zoomFactor: 3,
          centerPosition: {
            latitude: parseFloat(selectedCountry.latitude),
            longitude: parseFloat(selectedCountry.longitude),
          },
        },
        shapeData: world_map,
        mapData: [
          {
            name: formData.country,
            color: "#EA382E", // Country in red
          },
        ],
        markers: [],
      };
    }

    setMapConfig(newConfig);
  };

  const countryData = countries.map((country) => ({
    text: country.name,
    value: country.value,
  }));

  useEffect(() => {
    const getStates = () => {
      const selectedCountry = cityList.find((c) => c.name === formData.country);
      setStates(
        selectedCountry?.states?.map((s) => ({
          text: s.name,
          value: s.name,
          latitude: s.latitude,
          longitude: s.longitude,
        })) || []
      );
    };

    getStates();
    if (formData.state) {
      setFormData((prev) => ({ ...prev, state: "", city: "" }));
    }
  }, [formData.country]);

  useEffect(() => {
    const getCities = () => {
      const selectedCountry = cityList.find((c) => c.name === formData.country);
      const selectedState = selectedCountry?.states?.find(
        (s) => s.name === formData.state
      );

      setCities(
        selectedState?.cities?.map((c) => ({
          text: c.name,
          value: c.name,
          latitude: c.latitude,
          longitude: c.longitude,
        })) || []
      );
    };

    getCities();
    if (formData.city) {
      setFormData((prev) => ({ ...prev, city: "" }));
    }
  }, [formData.state]);

  useEffect(() => {
    updateMapConfiguration();
  }, [formData.country, formData.state, formData.city]);

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title="Add a New Trip"
        description="View and edit AI Generated travel plans"
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="country">Country</label>
            <ComboBoxComponent
              id="country"
              dataSource={countryData}
              fields={{ text: "text", value: "value" }}
              placeholder="Select a Country"
              className="combo-box"
              value={formData.country}
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("country", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  countries
                    .filter((country) =>
                      country.name.toLowerCase().includes(query)
                    )
                    .map((country) => ({
                      text: country.name,
                      value: country.value,
                    }))
                );
              }}
            />
          </div>

          <div>
            <label htmlFor="State">State</label>
            <ComboBoxComponent
              id="State"
              dataSource={states}
              fields={{ text: "text", value: "value" }}
              placeholder="Select a State"
              className="combo-box"
              value={formData.state}
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("state", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  states
                    .filter((state) => state.text.toLowerCase().includes(query))
                    .map((state) => ({
                      text: state.text,
                      value: state.value,
                    }))
                );
              }}
            />
          </div>

          <div>
            <label htmlFor="City">City</label>
            <ComboBoxComponent
              id="City"
              dataSource={cities}
              fields={{ text: "text", value: "value" }}
              placeholder="Select a City"
              className="combo-box"
              value={formData.city}
              change={(e: { value: string | undefined }) => {
                if (e.value) {
                  handleChange("city", e.value);
                }
              }}
              allowFiltering
              filtering={(e) => {
                const query = e.text.toLowerCase();

                e.updateData(
                  cities
                    .filter((city) => city.text.toLowerCase().includes(query))
                    .map((city) => ({
                      text: city.text,
                      value: city.value,
                    }))
                );
              }}
            />
          </div>

          <div>
            <label htmlFor="duration">Duration</label>
            <input
              id="duration"
              name="duration"
              type="number"
              placeholder="Enter a number of days"
              className="form-input placeholder:text-gray-100"
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>

          {selectItems.map((key) => (
            <div key={key}>
              <label htmlFor={key}>{capitalizeWords(key)}</label>

              <ComboBoxComponent
                id={key}
                dataSource={comboBoxItems[key].map((item) => ({
                  text: item,
                  value: item,
                }))}
                fields={{ text: "text", value: "value" }}
                placeholder={`Select ${capitalizeWords(key)}`}
                change={(e: { value: string | undefined }) => {
                  if (e.value) {
                    handleChange(key, e.value);
                  }
                }}
                allowFiltering
                filtering={(e) => {
                  const query = e.text.toLowerCase();

                  e.updateData(
                    comboBoxItems[key]
                      .filter((item) => item.toLowerCase().includes(query))
                      .map((item) => ({
                        text: item,
                        value: item,
                      }))
                  );
                }}
                className="combo-box"
              />
            </div>
          ))}

          <div>
            <label htmlFor="location">Location on the world map</label>
            <MapsComponent
              ref={mapRef}
              zoomSettings={mapConfig.zoomSettings}
              centerPosition={mapConfig.zoomSettings.centerPosition}
              enablePersistence={false}
              allowImageExport={false}
              allowPdfExport={false}
              allowPrint={false}
              height="400px"
              width="100%"
            >
              <Inject services={[MarkerService, Zoom]} />
              <LayersDirective>
                <LayerDirective
                  shapeData={mapConfig.shapeData}
                  dataSource={mapConfig.mapData}
                  shapePropertyPath="name"
                  shapeDataPath="name"
                  animationDuration={500}
                  shapeSettings={{
                    colorValuePath: "color",
                    fill: "#E5E5E5",
                    border: { color: "#C0C0C0", width: 0.5 },
                    colorMapping: [
                      {
                        value: "#EA382E",
                        color: "#EA382E",
                      },
                      {
                        value: "#E5E5E5",
                        color: "#E5E5E5",
                      },
                    ],
                  }}
                  selectionSettings={{
                    enable: false, // Disable selection
                  }}
                  highlightSettings={{
                    enable: false, // Disable highlight
                  }}
                />
              </LayersDirective>

              {mapConfig.markers.length > 0 && (
                <MarkersDirective>
                  {mapConfig.markers.map((marker, index) => (
                    <MarkerDirective
                      key={index}
                      visible={true}
                      latitude={marker.latitude}
                      longitude={marker.longitude}
                      shape="Circle"
                      fill="#EA382E"
                      height={15}
                      width={15}
                      border={{ color: "#FFFFFF", width: 3 }}
                      animationDuration={300}
                      tooltipSettings={{
                        visible: true,
                        template: `<div style="background: #333; color: white; padding: 8px; border-radius: 4px; font-size: 12px;">${marker.name}</div>`,
                      }}
                    />
                  ))}
                </MarkersDirective>
              )}
            </MapsComponent>
          </div>

          <div className="bg-gray-200 h-px w-full" />

          {error && (
            <div className="error">
              <p>{error}</p>
            </div>
          )}
          <footer className="px-6 w-full">
            <ButtonComponent
              type="submit"
              className="button-class !h-12 !w-full"
              disabled={loading}
            >
              <img
                src={`/assets/icons/${
                  loading ? "loader.svg" : "magic-star.svg"
                }`}
                className={cn("size-5", { "animate-spin": loading })}
              />
              <span className="p-16-semibold text-white">
                {loading ? "Generating..." : "Generate Trip"}
              </span>
            </ButtonComponent>
          </footer>
        </form>
      </section>
    </main>
  );
};

export default CreateTrip;
