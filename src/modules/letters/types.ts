import type { PaginationParams, Relationship, ResourceMeta } from '../../common/types.js';

/** Postal delivery product determining speed and cost of delivery. */
export type DeliveryProduct = 'fast' | 'cheap' | 'bulk' | 'premium' | 'registered';

/** Whether to print on one side (simplex) or both sides (duplex) of each sheet. */
export type PrintMode = 'simplex' | 'duplex';

/** Whether the letter is printed in full colour or greyscale. */
export type PrintSpectrum = 'color' | 'grayscale';

/** Horizontal position of the address window on the envelope. */
export type AddressPosition = 'left' | 'right';

/** Special paper type used for payment slips or direct-debit forms. */
export type PaperType = 'normal' | 'qr' | 'sepa_at' | 'sepa_de';

/** Origin channel through which the letter was submitted. */
export type LetterSource =
  | 'app'
  | 'api'
  | 'batch'
  | 'integration_email'
  | 'integration_s3'
  | 'integration_dropbox'
  | 'integration_googledrive'
  | 'integration_onedrive';

/** Parameters for listing letters within an organisation. */
export interface ListLettersParams extends PaginationParams {
  /** JSON:API include parameter for sideloading related resources. */
  readonly include?: string;
  /** Sparse fieldset for letter attributes. */
  readonly fieldsLetters?: readonly string[];
  /** Sparse fieldset for included organisation attributes. */
  readonly fieldsOrganisations?: readonly string[];
  /** Sparse fieldset for included batch attributes. */
  readonly fieldsBatches?: readonly string[];
}

/** Parameters for retrieving a single letter. */
export interface GetLetterParams {
  /** JSON:API include parameter for sideloading related resources. */
  readonly include?: string;
  /** Sparse fieldset for letter attributes. */
  readonly fieldsLetters?: readonly string[];
  /** Sparse fieldset for included organisation attributes. */
  readonly fieldsOrganisations?: readonly string[];
  /** Sparse fieldset for included batch attributes. */
  readonly fieldsBatches?: readonly string[];
}

/** A parsed postal address extracted from the letter PDF. */
export interface MetaDataAddress {
  /** Full name of the addressee or sender. */
  readonly name: string;
  /** Street name. */
  readonly street: string;
  /** P.O. box number, if applicable. */
  readonly pobox: string;
  /** House or building number. */
  readonly number: string;
  /** Postal code. */
  readonly zip: string;
  /** City or locality. */
  readonly city: string;
  /** ISO 3166-1 alpha-2 country code. */
  readonly country: string;
}

/** Sender and recipient address metadata extracted from a letter PDF. */
export interface MetaData {
  /** Recipient address parsed from the letter. */
  readonly recipient: MetaDataAddress;
  /** Sender address parsed from the letter. */
  readonly sender: MetaDataAddress;
}

/**
 * Data required to create a new letter.
 *
 * `file_url` and `file_url_signature` must be obtained from the file upload
 * endpoint before calling the create letter endpoint.
 */
export interface CreateLetterData {
  /** Original filename of the uploaded PDF (e.g. `"invoice.pdf"`). */
  readonly file_original_name: string;
  /** Presigned URL of the uploaded file, returned by the file upload endpoint. */
  readonly file_url: string;
  /** Signature token validating the file URL, returned by the file upload endpoint. */
  readonly file_url_signature: string;
  /** Position of the address window on the envelope. */
  readonly address_position: AddressPosition;
  /** When `true`, the letter is submitted for sending immediately after creation. */
  readonly auto_send: boolean;
  /** Postal delivery product. Required when `auto_send` is `true`. */
  readonly delivery_product?: DeliveryProduct;
  /** Single- or double-sided printing. Required when `auto_send` is `true`. */
  readonly print_mode?: PrintMode;
  /** Colour or greyscale printing. Required when `auto_send` is `true`. */
  readonly print_spectrum?: PrintSpectrum;
  /** Override or supplement address metadata extracted from the PDF. */
  readonly meta_data?: MetaData;
  /** ID of a preset to apply default send settings from. */
  readonly preset_id?: string;
}

/** Data for updating mutable attributes of an existing letter. */
export interface UpdateLetterData {
  /** Paper types to associate with the letter (e.g. for QR or SEPA slips). */
  readonly paper_types?: readonly PaperType[];
}

/** Data required to submit a letter for sending. */
export interface SendLetterData {
  /** Postal delivery product. */
  readonly delivery_product: DeliveryProduct;
  /** Single- or double-sided printing. */
  readonly print_mode: PrintMode;
  /** Colour or greyscale printing. */
  readonly print_spectrum: PrintSpectrum;
  /** Override or supplement address metadata extracted from the PDF. */
  readonly meta_data?: MetaData;
}

/** Data required to calculate the postage price for a letter. */
export interface CalculatePriceData {
  /** ISO 3166-1 alpha-2 destination country code. */
  readonly country: string;
  /** Paper types included in the letter. */
  readonly paper_types: readonly PaperType[];
  /** Single- or double-sided printing. */
  readonly print_mode: PrintMode;
  /** Colour or greyscale printing. */
  readonly print_spectrum: PrintSpectrum;
  /** Postal delivery product. */
  readonly delivery_product: DeliveryProduct;
}

/** A font detected in or embedded within the letter PDF. */
export interface LetterFont {
  /** PostScript or full name of the font. */
  readonly name: string;
  /** Whether the font is fully embedded in the PDF. */
  readonly is_embedded: boolean;
}

/** Attributes of a letter resource. */
export interface LetterAttributes {
  /** Current processing or delivery status of the letter. */
  readonly status: string;
  /** Original filename of the uploaded PDF. */
  readonly file_original_name: string;
  /** Number of pages in the letter PDF. */
  readonly file_pages: number;
  /** Formatted delivery address extracted from the PDF. */
  readonly address: string;
  /** Position of the address window on the envelope. */
  readonly address_position: AddressPosition;
  /** ISO 3166-1 alpha-2 destination country code. */
  readonly country: string;
  /** Postal delivery product selected for this letter. */
  readonly delivery_product: DeliveryProduct;
  /** Single- or double-sided printing mode. */
  readonly print_mode: PrintMode;
  /** Colour or greyscale print spectrum. */
  readonly print_spectrum: PrintSpectrum;
  /** ISO 4217 currency code of the postage price. */
  readonly price_currency: string;
  /** Postage price charged for this letter. */
  readonly price_value: number;
  /** Paper types detected in or applied to this letter. */
  readonly paper_types: readonly string[];
  /** Fonts present in the letter PDF. */
  readonly fonts: readonly LetterFont[];
  /** Channel through which the letter was submitted. */
  readonly source: LetterSource;
  /** Carrier tracking number, available after the letter is dispatched. */
  readonly tracking_number: string;
  /** ISO 8601 timestamp of when the letter was submitted for sending. */
  readonly submitted_at: string;
  /** ISO 8601 timestamp of when the letter was created. */
  readonly created_at: string;
  /** ISO 8601 timestamp of the most recent update. */
  readonly updated_at: string;
}

/**
 * A Pingen letter resource in JSON:API format.
 *
 * Letters represent individual physical mail pieces managed within an organisation.
 */
export interface Letter {
  /** Unique identifier of the letter. */
  readonly id: string;
  /** JSON:API resource type — always `"letters"`. */
  readonly type: 'letters';
  /** Detailed attributes of the letter. */
  readonly attributes: LetterAttributes;
  /** Related resources linked to this letter. */
  readonly relationships: {
    readonly organisation: Relationship;
    readonly events: Relationship;
    readonly batch: Relationship;
  };
  /** Links related to this resource. */
  readonly links: { readonly self: string };
  /** Optional server-provided metadata. */
  readonly meta?: ResourceMeta;
}

/** Attributes of a price calculation result. */
export interface PriceResultAttributes {
  /** ISO 4217 currency code of the calculated price. */
  readonly currency: string;
  /** Calculated postage price. */
  readonly price: number;
}

/**
 * A Pingen letter price calculation result in JSON:API format.
 *
 * Returned by the price calculator endpoint; does not persist as a resource.
 */
export interface PriceResult {
  /** Identifier of the price calculation result. */
  readonly id: string;
  /** JSON:API resource type — always `"letter_price_calculators"`. */
  readonly type: 'letter_price_calculators';
  /** Calculated price attributes. */
  readonly attributes: PriceResultAttributes;
  /** Links related to this resource. */
  readonly links: { readonly self: string };
}
