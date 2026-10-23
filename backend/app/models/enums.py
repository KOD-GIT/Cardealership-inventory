import enum


class Role(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"


class VehicleCategory(str, enum.Enum):
    SEDAN = "SEDAN"
    SUV = "SUV"
    HATCHBACK = "HATCHBACK"
    COUPE = "COUPE"
    CONVERTIBLE = "CONVERTIBLE"
    TRUCK = "TRUCK"
    VAN = "VAN"
