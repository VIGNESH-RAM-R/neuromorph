import { Country, State } from 'country-state-city';

const LOCATION_OPTIONS = [
  ...Country.getAllCountries().map((country) => country.name),
  ...State.getAllStates().map((state) => {
    const country = Country.getCountryByCode(state.countryCode);
    return `${state.name}, ${country?.name || state.countryCode}`;
  }),
].sort((first, second) => first.localeCompare(second));

// Uses a local catalog so the same country and state/province suggestions
// are available in every role flow, including deployments without API keys.
export default function PlaceAutocompleteField({ value, onChange, placeholder, ariaInvalid }) {
  return (
    <>
      <input
        type="text"
        list="nmpa-location-options"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        autoComplete="off"
      />
      <datalist id="nmpa-location-options">
        {LOCATION_OPTIONS.map((location) => <option key={location} value={location} />)}
      </datalist>
      <span className="nmpa-muted nmpa-muted--sm">
        {value ? `Selected: ${value}` : 'Start typing to search all countries and states or provinces.'}
      </span>
    </>
  );
}
