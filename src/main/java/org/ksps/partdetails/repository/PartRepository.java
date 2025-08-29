package org.ksps.partdetails.repository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Repository
public class PartRepository {

    @Autowired
    NamedParameterJdbcTemplate namedParameterJdbcTemplate;

    /**
     * Fetch all parts where the Primary column value is in the provided list.
     * If the list is null or empty, returns an empty result immediately.
     */
    public List<Map<String, Object>> findByPrimaryIn(List<String> primaryList) {
        if (primaryList == null || primaryList.isEmpty()) {
            return Collections.emptyList();
        }
        String sql = "SELECT * FROM public.parts WHERE \"Primary\" IN (:primaryList)";
        MapSqlParameterSource params = new MapSqlParameterSource("primaryList", primaryList);
        return namedParameterJdbcTemplate.queryForList(sql, params);
    }

}


