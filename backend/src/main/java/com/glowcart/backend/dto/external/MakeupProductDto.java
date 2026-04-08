package com.glowcart.backend.dto.external;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class MakeupProductDto {

    private Integer id;

    private String name;

    private String brand;

    private String price;

    private String description;

    @JsonProperty("product_type")
    private String productType;

    private String category;

    @JsonProperty("image_link")
    private String imageLink;

    @JsonProperty("product_link")
    private String productLink;

    private Double rating;
}