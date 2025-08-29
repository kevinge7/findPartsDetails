package org.ksps.partdetails.controller;

import org.ksps.partdetails.service.PartServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class PartController {

    @Autowired
    private PartServiceImpl partService;


    // Option 1: GET with comma-separated query param, e.g., /api/findParts?primary=123,456,789
    @GetMapping("/findParts")
    public ResponseEntity<Map<String, Object>> findPartsByQuery(
            @RequestParam("primary") List<String> primaryParam // 支持 ?primary=A,B 或 ?primary=A&primary=B
    ) {
        List<String> list = primaryParam.stream()
                .flatMap(s -> Arrays.stream(s.split(","))) // 兼容 A,B 这种一串逗号
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .distinct()
                .collect(Collectors.toList());

        List<Map<String, Object>> parts = partService.findPartsByPrimary(list);

        return ResponseEntity.ok(Map.of(
                "primary", list,
                "results", parts
        ));
    }


    // Option 2: POST with JSON body array, e.g., ["123","456"]
    @PostMapping("/findParts")
    public ResponseEntity<Map<String, Object>> findPartsByBody(@RequestBody List<String> primaryList) {
        List<Map<String, Object>> parts = partService.findPartsByPrimary(primaryList);
        return ResponseEntity.ok(Map.of(
                "primary", primaryList,
                "results", parts
        ));
    }
}
