import { ComboBoxComponent } from "@syncfusion/ej2-react-dropdowns";
import { comboBoxItems, selectItems } from "~/constants";
import { cn, capitalizeWords } from "~/lib/utils";
import {
  LayerDirective,
  LayersDirective,
  MapsComponent,
  Inject,
  Zoom,
} from "@syncfusion/ej2-react-maps";
import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import worldMap from "~/constants/world_map.json";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { account } from "~/appwrite/client";
import { useNavigate } from "react-router";
import { Header } from "components";
import { cityList } from "~/constants/country_city";

const DEFAULT_MAP_CONFIG = {
  zoomSettings: {
    enable: true,
    maxZoom: 10,
    minZoom: 1,
    zoomOnClick: false,
    mouseWheelZoom: false,
    doubleClickZoom: false,
    pinchZooming: false,
    toolbars: [],
  },
  centerPosition: { latitude: 20, longitude: 0 },
  shapeSettings: {
    fill: "#E5E5E5",
    colorValuePath: "color",
    colorMapping: [{ value: "highlight", color: "#EA382E" }],
  },
};

const INITIAL_FORM_DATA = {
  country: "",
  state: "",
  city: "",
  currency: "",
  currencySymbol: "",
  travelStyle: "",
  interest: "",
  budget: "",
  duration: 0,
  groupType: "",
};

const REQUIRED_FIELDS = [
  "country",
  "currency",
  "travelStyle",
  "interest",
  "budget",
  "groupType",
  "duration",
];

const CreateTrip = () => {
  const navigate = useNavigate();
  const mapRef = useRef<MapsComponent>(null);

  const [formData, setFormData] = useState<TripFormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const countries = useMemo(
    () =>
      cityList.map((country: any) => ({
        name: country.emoji + country.name,
        text: country.emoji + country.name,
        value: country.name,
        latitude: parseFloat(country.latitude),
        longitude: parseFloat(country.longitude),
        currency: country.currency,
        currencySymbol: country.currency_symbol,
      })),
    []
  );

  const allCurrencies = useMemo(() => {
    const currencyMap = new Map<string, string>();
    cityList.forEach((country) => {
      if (country.currency && country.currency_symbol) {
        currencyMap.set(country.currency, country.currency_symbol);
      }
    });

    return Array.from(currencyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([currency, symbol]) => ({
        text: `${symbol} ${currency}`,
        value: currency,
        symbol: symbol,
      }));
  }, []);

  const { states, cities, selectedCountry, selectedState } = useMemo(() => {
    const selectedCountry = cityList.find((c) => c.name === formData.country);
    const selectedState = selectedCountry?.states?.find(
      (s) => s.name === formData.state
    );

    const states =
      selectedCountry?.states?.map((s) => ({
        text: s.name,
        value: s.name,
      })) || [];

    const cities =
      selectedState?.cities?.map((c) => ({
        text: c.name,
        value: c.name,
      })) || [];

    return { states, cities, selectedCountry, selectedState };
  }, [formData.country, formData.state]);

  const mapConfig = useMemo(() => {
    const config = {
      ...DEFAULT_MAP_CONFIG,
      zoomSettings: {
        ...DEFAULT_MAP_CONFIG.zoomSettings,
        zoomFactor: 1,
      },
      centerPosition: { latitude: 20, longitude: 0 },
    };

    const dataSource = [];

    if (formData.country) {
      dataSource.push({ name: formData.country, color: "highlight" });

      if (formData.state && selectedState && selectedCountry) {
        config.zoomSettings.zoomFactor = 4;
        config.centerPosition = {
          latitude: selectedCountry?.latitude
            ? parseFloat(selectedCountry.latitude)
            : 20,
          longitude: selectedCountry?.longitude
            ? parseFloat(selectedCountry.longitude)
            : 0,
        };
      }
    }

    return {
      ...config,
      dataSource,
      layerConfig: {
        shapeData: worldMap,
        shapePropertyPath: "name",
        shapeDataPath: "name",
        dataSource,
        shapeSettings: DEFAULT_MAP_CONFIG.shapeSettings,
      },
    };
  }, [formData.country, formData.state, selectedCountry, selectedState]);

  const handleChange = useCallback(
    (key: keyof TripFormData, value: string | number) => {
      setFormData((prev) => {
        const newData = { ...prev, [key]: value };

        if (key === "country") {
          newData.state = "";
          newData.city = "";
          const selectedCountry = countries.find((c) => c.value === value);
          if (selectedCountry?.currency) {
            newData.currency = selectedCountry.currency;
            newData.currencySymbol = selectedCountry.currencySymbol;
          }
        } else if (key === "state") {
          newData.city = "";
        } else if (key === "currency") {
          const selectedCurrency = allCurrencies.find((c) => c.value === value);
          if (selectedCurrency?.symbol) {
            newData.currencySymbol = selectedCurrency.symbol;
          }
        }

        return newData;
      });
    },
    [countries, allCurrencies]
  );

  const validateForm = useCallback(() => {
    const missingFields = REQUIRED_FIELDS.filter((field) => !formData[field]);

    if (missingFields.length > 0) {
      return "Please provide values for all required fields";
    }

    if (formData.duration < 1 || formData.duration > 10) {
      return "Duration must be between 1 and 10 days";
    }

    return null;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = await account.get();
      if (!user.$id) {
        throw new Error("User not authenticated");
      }

      const response = await fetch("/api/create-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          country: formData.country,
          state: formData.state || "",
          city: formData.city || "",
          numberOfDays: formData.duration,
          travelStyle: formData.travelStyle,
          currency: formData.currency,
          currencySymbol: formData.currencySymbol,
          interests: formData.interest,
          budget: formData.budget,
          groupType: formData.groupType,
          userId: user.$id,
        }),
      });

      const result: CreateTripResponse = await response.json();

      if (result?.id) {
        navigate(`/trips/${result.id}`);
      } else {
        throw new Error("Failed to generate a trip");
      }
    } catch (error) {
      console.error("Error generating trip:", error);
      setError("Failed to generate trip. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isRequiredField = (fieldId: string) => {
    return REQUIRED_FIELDS.includes(fieldId);
  };

  const FormLabel = ({
    htmlFor,
    children,
    required = false,
  }: {
    htmlFor: string;
    children: React.ReactNode;
    required?: boolean;
  }) => (
    <label htmlFor={htmlFor}>
      {children}
      {required && (
        <span style={{ color: "#EA382E", marginLeft: "4px" }}>*</span>
      )}
    </label>
  );

  const ComboBox = ({
    id,
    label,
    dataSource,
    placeholder,
    value,
    filterFn,
    isCurrency = false,
  }: {
    id: keyof TripFormData;
    label: string;
    dataSource: { text: string; value: string; symbol?: string }[];
    placeholder: string;
    value: string;
    filterFn?: (items: any[], query: string) => any[];
    isCurrency?: boolean;
  }) => {
    const itemTemplate = (data: any) => {
      if (isCurrency && data.symbol) {
        return (
          <div>
            (
            <span style={{ color: "#EA382E", fontWeight: "bold" }}>
              {data.symbol}
            </span>
            )<span> {data.value}</span>
          </div>
        );
      }
      return <div>{data.text}</div>;
    };

    return (
      <div>
        <FormLabel htmlFor={id} required={isRequiredField(id)}>
          {label}
        </FormLabel>
        <ComboBoxComponent
          id={id}
          dataSource={dataSource}
          fields={{ text: "text", value: "value" }}
          placeholder={placeholder}
          className="combo-box"
          value={value}
          change={(e: { value: string | undefined }) => {
            if (e.value) handleChange(id, e.value);
          }}
          allowFiltering
          filtering={(e) => {
            const query = e.text.toLowerCase();
            const filtered = filterFn
              ? filterFn(dataSource, query)
              : dataSource.filter((item) =>
                  item.text.toLowerCase().includes(query)
                );
            e.updateData(filtered);
          }}
          itemTemplate={isCurrency ? itemTemplate : undefined}
        />
      </div>
    );
  };

  useEffect(() => {
    return () => {
      mapRef.current?.destroy?.();
    };
  }, []);

  return (
    <main className="flex flex-col gap-10 pb-20 wrapper">
      <Header
        title="Add a New Trip"
        description="View and edit AI Generated travel plans"
      />

      <section className="mt-2.5 wrapper-md">
        <form className="trip-form" onSubmit={handleSubmit}>
          <ComboBox
            id="country"
            label="Country"
            dataSource={countries}
            placeholder="Select a Country"
            value={formData.country}
            filterFn={(items, query) =>
              items.filter((item) => item.text.toLowerCase().includes(query))
            }
          />

          {formData.country && states.length > 0 && (
            <ComboBox
              id="state"
              label="State"
              dataSource={states}
              placeholder="Select a State"
              value={formData.state}
            />
          )}

          {formData.state && cities.length > 0 && (
            <ComboBox
              id="city"
              label="City"
              dataSource={cities}
              placeholder="Select a City"
              value={formData.city}
            />
          )}

          <div>
            <FormLabel htmlFor="duration" required={true}>
              Duration
            </FormLabel>
            <input
              id="duration"
              name="duration"
              type="number"
              min="1"
              max="10"
              placeholder="Enter a number of days"
              className="form-input placeholder:text-gray-100"
              value={formData.duration || ""}
              onChange={(e) => handleChange("duration", Number(e.target.value))}
            />
          </div>

          {formData.country && (
            <ComboBox
              id="currency"
              label="Currency"
              dataSource={allCurrencies}
              placeholder="Select Currency"
              value={formData.currency}
              filterFn={(items, query) =>
                items.filter((item) => item.text.toLowerCase().includes(query))
              }
              isCurrency={true}
            />
          )}

          {selectItems.map((key) => (
            <ComboBox
              key={key}
              id={key}
              label={capitalizeWords(key)}
              dataSource={comboBoxItems[key].map((item) => ({
                text: item,
                value: item,
              }))}
              placeholder={`Select ${capitalizeWords(key)}`}
              value={formData[key]}
              filterFn={(items, query) =>
                items.filter((item) => item.text.toLowerCase().includes(query))
              }
            />
          ))}

          <div>
            <FormLabel htmlFor="location" required={false}>
              Location on the world map
            </FormLabel>
            <div
              style={{ height: "400px", width: "100%", pointerEvents: "none" }}
            >
              <MapsComponent
                ref={mapRef}
                key={`${formData.country}-${formData.state}`}
                zoomSettings={mapConfig.zoomSettings}
                centerPosition={mapConfig.centerPosition}
                height="400px"
                width="100%"
                enablePersistence={false}
                enableRtl={false}
                allowImageExport={false}
                allowPdfExport={false}
                allowPrint={false}
              >
                <Inject services={[Zoom]} />
                <LayersDirective>
                  <LayerDirective {...mapConfig.layerConfig} />
                </LayersDirective>
              </MapsComponent>
            </div>
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
                alt={loading ? "Loading" : "Magic star"}
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
