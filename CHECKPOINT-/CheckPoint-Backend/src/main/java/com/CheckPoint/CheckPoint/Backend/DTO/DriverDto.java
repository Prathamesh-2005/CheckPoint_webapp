package com.CheckPoint.CheckPoint.Backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverDto {
    private UUID id;
    private String firstName;
}
