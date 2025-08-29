package org.ksps.partdetails.service;

import org.ksps.partdetails.repository.PartRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class PartServiceImpl{

    @Autowired
    PartRepository partRepository;

    public List<Map<String, Object>> findPartsByPrimary(List<String> primaryList) {
        if (primaryList == null || primaryList.isEmpty()) {
            return List.of();
        }
        // Deduplicate while preserving order
        LinkedHashSet<String> deduped = new LinkedHashSet<>();
        for (String p : primaryList) {
            if (p != null && !p.isBlank()) deduped.add(p.trim());
        }
        if (deduped.isEmpty()) return List.of();
        return partRepository.findByPrimaryIn(new ArrayList<>(deduped));
    }
}
