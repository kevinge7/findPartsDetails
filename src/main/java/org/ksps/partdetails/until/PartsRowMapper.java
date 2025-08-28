package org.ksps.partdetails.until;

import org.ksps.partdetails.DTO.PartsDto;
import org.springframework.jdbc.core.RowMapper;

import java.sql.ResultSet;
import java.sql.SQLException;

public class PartsRowMapper implements RowMapper<PartsDto> {

    @Override
    public PartsDto mapRow(ResultSet rs, int rowNum) throws SQLException {
        PartsDto dto = new PartsDto();
        dto.setItem(rs.getString("Item"));
        dto.setSubCategory1(rs.getString("Sub-Category 1"));
        dto.setMake(rs.getString("Make"));
        dto.setCcode(rs.getString("CCode"));
        dto.setPrimary(rs.getString("Primary"));
        dto.setKsp(rs.getString("KSP"));
        dto.setParentItem(rs.getString("Parent Item"));
        dto.setPrimaryMake(rs.getString("Primary Make"));
        dto.setPrimaryModel(rs.getString("Primary Model"));
        dto.setOem(rs.getString("OEM"));
        dto.setAddlInfo(rs.getString("Addl Info"));
        dto.setKgs(rs.getString("KGs"));
        dto.setW1(rs.getString("W1"));
        return dto;
    }
}
