<?php
/**
 * Customizer sections.
 *
 * @package imaga
 */

/**
 * Register the section sections.
 *
 * @author WDS
 * @param object $wp_customize Instance of WP_Customize_Class.
 */
function imaga_customize_sections( $wp_customize ) {

	// Register additional scripts section.
	$wp_customize->add_section(
		'imaga_additional_scripts_section',
		array(
			'title'    => esc_html__( 'Additional Scripts', 'imaga' ),
			'priority' => 10,
			'panel'    => 'site-options',
		)
	);

	// Register a social links section.
	$wp_customize->add_section(
		'imaga_social_links_section',
		array(
			'title'       => esc_html__( 'Social Media', 'imaga' ),
			'description' => esc_html__( 'Links here power the display_social_network_links() template tag.', 'imaga' ),
			'priority'    => 90,
			'panel'       => 'site-options',
		)
	);

	// Register a header section.
	$wp_customize->add_section(
		'imaga_header_section',
		array(
			'title'    => esc_html__( 'Header Customizations', 'imaga' ),
			'priority' => 90,
			'panel'    => 'site-options',
		)
	);

	// Register a footer section.
	$wp_customize->add_section(
		'imaga_footer_section',
		array(
			'title'    => esc_html__( 'Footer Customizations', 'imaga' ),
			'priority' => 90,
			'panel'    => 'site-options',
		)
	);
}
add_action( 'customize_register', 'imaga_customize_sections' );
