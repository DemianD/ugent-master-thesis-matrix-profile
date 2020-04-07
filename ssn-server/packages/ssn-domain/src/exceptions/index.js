export class NotFoundException extends Error {}

export class InvalidDateException extends Error {}

export class PageNotFoundException extends NotFoundException {}

export class FeatureOfInterestNotFoundException extends NotFoundException {}

export class ObservablePropertyNotFoundException extends NotFoundException {}
