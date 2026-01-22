package com.CheckPoint.CheckPoint.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class DriverDto {
    private UUID id;
    private String firstName;

    public DriverDto(UUID id, String firstName) {
        this.id = id;
        this.firstName = firstName;
    }
}
